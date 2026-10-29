const fs    = require('fs');
const https = require('https');
const path  = require('path');
const tls   = require('tls');

/**
 * ============================================================================
 *                               REMOTE SOURCES
 * ============================================================================
 * Same endpoints used by the Meteo Trentino app (meteotrentino-app-3).
 */
const METEO_REPORT   = 'https://meteo.report/var/data';
const RADAR          = 'https://radar.meteotrentino.it';
const CONTENUTI      = 'https://contenuti.meteotrentino.it';
const ALERTS_URL     = 'http://avvisi.protezionecivile.tn.it/elencoavvisi.aspx';

const TIMEOUT_MS = 20000;

let request = async (url, type = 'json') => {
	const res = await fetch(url, {
		redirect: 'follow',
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers: { 'User-Agent': 'MeteoTrentinoBot (+https://t.me/meteotrentinobot)' }
	});
	if (!res.ok) {
		throw new Error(`HTTP ${res.status} for ${url}`);
	}
	if (type === 'buffer') return Buffer.from(await res.arrayBuffer());
	const text = await res.text();
	// some meteotrentino endpoints prepend a BOM
	return type === 'json' ? JSON.parse(text.replace(/^﻿/, '')) : text;
};

/**
 * Tiny in-memory cache: upstream data refreshes a few times per day,
 * no need to hit it for every button press.
 */
const cache = new Map();
let cached = (key, ttlMs, loader) => {
	const hit = cache.get(key);
	if (hit && hit.expires > Date.now()) return hit.value;
	const value = loader().catch((e) => {
		cache.delete(key);
		throw e;
	});
	cache.set(key, { value, expires: Date.now() + ttlMs });
	return value;
};

const MIN = 60 * 1000;

/**
 * Forecast for a single meteo.report venue:
 * { start, end, "180": { <layoutId>: {...3h slot} }, "1440": { <layoutId>: {...day} } }
 */
let GET_VenueForecast = (venueId) =>
	cached(`forecast:${venueId}`, 10 * MIN, () => request(`${METEO_REPORT}/forecasts/${venueId}.json`));

/**
 * Text bulletins written by the forecasters (Meteotrentino, Alto Adige, Tirolo, Euregio).
 */
let GET_TextBulletins = () =>
	cached('bulletins', 15 * MIN, () => request(`${METEO_REPORT}/bulletins/it/bulletins.json`));

let GET_AlertsList = () =>
	cached('alerts', 5 * MIN, () => request(ALERTS_URL, 'text'));

/**
 * Station observations: { start, end, "30": { <layoutId>: {...} }, "1440": {...} }
 */
let GET_StationObservations = (stationId) =>
	cached(`obs:${stationId}`, 5 * MIN, () => request(`${METEO_REPORT}/observations/${stationId}.json`));

/**
 * radar.meteotrentino.it does not send its intermediate certificate
 * (Actalis DV G3), so Node can't verify it with the default store:
 * download media through an agent that also trusts that intermediate.
 */
const mediaAgent = new https.Agent({
	ca: [...tls.rootCertificates, fs.readFileSync(path.join(__dirname, 'config', 'certs', 'actalis-dv-g3.pem'), 'utf8')]
});

let GET_Media = (url) => new Promise((resolve, reject) => {
	const req = https.get(url, { agent: mediaAgent, timeout: TIMEOUT_MS }, (res) => {
		if (res.statusCode !== 200) {
			res.resume();
			return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
		}
		const chunks = [];
		res.on('data', (c) => chunks.push(c));
		res.on('end', () => resolve(Buffer.concat(chunks)));
		res.on('error', reject);
	});
	req.on('timeout', () => req.destroy(new Error(`timeout for ${url}`)));
	req.on('error', reject);
});

const MEDIA = {
	RADAR_MOSAIC:   `${RADAR}/radar/G_mosaico.mp4`,
	RADAR_3H:       `${RADAR}/radar/last_3h.mp4`,
	RADAR_24H:      `${RADAR}/radar/last_24h.mp4`,
	LIGHTNING_ANIM: `${RADAR}/fulmini/anim_lampinetF.gif`,
	LIGHTNING_LAST: `${RADAR}/fulmini/ultima_mappa_lampinet_BIG.png`,
	HAIL_PROB:      `${RADAR}/radar/UpdatedDailyMaxHailProb.png`,
	WIND_RIVA:      `${CONTENUTI}/dati-meteo/meteogrammi/riva_garda.png`,
	WIND_MEDIO:     `${CONTENUTI}/dati-meteo/meteogrammi/medio_garda.png`,
	AUDIO_BULLETIN: `${CONTENUTI}/Bollettini/Audio/sintetico.mp3`
};

module.exports = {
	GET_VenueForecast,
	GET_TextBulletins,
	GET_AlertsList,
	GET_StationObservations,
	GET_Media,
	ALERTS_URL,
	MEDIA
};
