const API       = require('./API');
const { esc }   = require('./format');
const locations = require('./locations');
const time      = require('./time');
const stations  = require('./config/stations.json');

const HALF_HOUR = '30';
const DAILY = '1440';

/**
 * ============================================================================
 *                           STATION LIST
 * ============================================================================
 * Trentino stations of the Euregio network (same list used by the app),
 * filtered to the ones publishing observations: see scripts/update-data.js.
 */
let getStationNamesAsKeyboard = () => {
	const rows = [[{ text: '📡 Stazione più vicina a me', request_location: true }], ['❌ Annulla']];
	for (let i = 0; i < stations.length; i += 2) {
		rows.push(stations.slice(i, i + 2).map((s) => s.name));
	}
	return { reply_markup: { keyboard: rows, resize_keyboard: true, one_time_keyboard: true } };
};

let findStation = (text) => {
	const q = locations.normalize(text);
	return stations.find((s) => locations.normalize(s.name) === q) ||
		stations.find((s) => locations.normalize(s.name).startsWith(q)) ||
		null;
};

let getStation = (id) => stations.find((s) => s.id === id) || null;

let nearestStation = (lat, lon) => {
	const near = locations.nearest(stations, lat, lon);
	return { station: near.item, distanceKm: near.distanceKm };
};

/**
 * ============================================================================
 *                          STATION MESSAGE
 * ============================================================================
 */
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
let compass = (deg) => COMPASS[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
let has = (v) => v !== null && v !== undefined && !isNaN(v);
let fmt = (v, digits = 1) => has(v) ? Number(v).toFixed(digits).replace('.', ',') : '–';
let sum = (arr, key) => arr.reduce((t, r) => t + (Number(r.entry[key]) || 0), 0);
let values = (arr, key) => arr.map((r) => r.entry[key]).filter(has);

/**
 * @param id    station id (meteo.report venue id)
 * @param full  show the last 24 hourly readings instead of the last 6
 */
let getStationData = async (id, full) => {
	const station = getStation(id);
	if (!station) throw new Error(`unknown station ${id}`);

	const now = Date.now();
	const layouts = time.parseLayouts(await API.GET_StationObservations(id));
	const slots = (layouts[HALF_HOUR] || [])
		.filter((s) => s.start <= now && Object.values(s.entry).some(has));
	const last = slots[slots.length - 1];
	if (!last) throw new Error(`no data for station ${id}`);
	const e = last.entry;

	let text = `🌡 <b>${esc(station.name)}</b>`;
	if (station.elevation) text += ` · ${station.elevation} m`;
	text += `\n<i>Ultima lettura ${time.romeTime(Math.min(last.end, now))}</i>\n`;

	if (has(e.temperature)) text += `\n🌡 Temperatura <b>${fmt(e.temperature)}°C</b>`;

	const today = slots.filter((s) => time.romeDate(s.start) === time.romeDate(now));
	const temps = values(today, 'temperature');
	if (temps.length) text += `\n↕️ Oggi min ${fmt(Math.min(...temps))}° · max ${fmt(Math.max(...temps))}°`;

	if (has(e.relative_humidity)) text += `\n💧 Umidità ${fmt(e.relative_humidity, 0)}%`;

	if (values(today, 'rain_fall').length) {
		const lastHourRain = sum(slots.slice(-2), 'rain_fall');
		text += `\n☔️ Pioggia oggi ${fmt(sum(today, 'rain_fall'))} mm`;
		if (lastHourRain > 0) text += ` (ultima ora ${fmt(lastHourRain)} mm)`;
	}

	if (has(e.wind_speed)) {
		text += `\n💨 Vento ${fmt(e.wind_speed, 0)} km/h`;
		if (has(e.wind_direction)) text += ` da ${compass(e.wind_direction)}`;
		if (has(e.wind_gust)) text += ` · raffica ${fmt(e.wind_gust, 0)} km/h`;
	}

	if (has(e.pressure)) text += `\n🧭 Pressione ${fmt(e.pressure, 0)} hPa`;

	// rain of the last days, from the daily totals
	if (full) {
		const pastDays = (layouts[DAILY] || []).filter((d) => d.end <= now && has(d.entry.temperature_minimum)).slice(-6);
		if (pastDays.length) {
			text += '\n\n🗓 <b>Ultimi giorni</b>';
			pastDays.reverse().forEach((d) => {
				const de = d.entry;
				text += `\n<code>${time.romeLabel(d.start, { weekday: 'short', day: 'numeric' })}</code>  ${fmt(de.temperature_minimum)}° / ${fmt(de.temperature_maximum)}°`;
				if (Number(de.rain_fall) > 0) text += `  ☔️ ${fmt(de.rain_fall)} mm`;
			});
		}
	}

	// hourly trend
	const hourly = slots.filter((s) => time.romeTime(s.start).endsWith(':00') && has(s.entry.temperature));
	const rows = hourly.slice(full ? -24 : -6).reverse();
	if (rows.length) {
		text += `\n\n📈 <b>${full ? 'Ultime 24 ore' : 'Ultime ore'}</b>`;
		rows.forEach((r) => {
			const hourRain = sum(slots.filter((s) => s.start >= r.start && s.start < r.start + 3600000), 'rain_fall');
			text += `\n<code>${time.romeTime(r.start)}</code>  ${fmt(r.entry.temperature)}°`;
			if (hourRain > 0) text += `  ☔️ ${fmt(hourRain)} mm`;
		});
	}

	text += '\n\n<i>Fonte: Meteotrentino · meteo.report</i>';

	return {
		text,
		extra: {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: [[
					full
						? { text: '➖ Meno dati', callback_data: `S|${id}|0` }
						: { text: '➕ Ultime 24 ore', callback_data: `S|${id}|1` },
					{ text: '🔄', callback_data: `S|${id}|${full ? 1 : 0}|r` }
				]]
			}
		}
	};
};

module.exports = {
	getStationNamesAsKeyboard,
	findStation,
	nearestStation,
	getStationData
};
