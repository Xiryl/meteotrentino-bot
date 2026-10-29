const API          = require('./API');
const { getSky }   = require('./config/sky_conditions');
const { esc }      = require('./format');
const locations    = require('./locations');
const time         = require('./time');

const DAILY = '1440';
const THREE_HOURS = '180';

// forecaster text bulletins (meteo.report), Trentino first then Euregio
const BULLETIN_SOURCES = [
	{ id: 'fba93146-7192-4190-adab-605435fdeea1', source: 'Meteotrentino' },
	{ id: '1aa901c4-2315-4b71-a871-a0a506f90ff1', source: 'Euregio' }
];

/**
 * ============================================================================
 *                             DATA SHAPING
 * ============================================================================
 */
let buildDays = (layouts, now) => {
	const today = time.romeDate(now);
	return (layouts[DAILY] || [])
		.filter((d) => d.end > now)
		.map((d) => ({ ...d, date: time.romeDate(d.start), isToday: time.romeDate(d.start) === today }));
};

let pickBulletin = (bulletins, dayLayoutId) => {
	if (!Array.isArray(bulletins)) return null;
	const forDay = bulletins.filter((b) => Number(b.id_time_layout) === dayLayoutId && b.value);
	for (const region of BULLETIN_SOURCES) {
		const found = forDay
			.filter((b) => b.id_venue === region.id)
			.sort((a, b) => String(b.last_update).localeCompare(String(a.last_update)))[0];
		if (found) return { text: found.value.trim(), source: region.source };
	}
	return null;
};

/**
 * ============================================================================
 *                             FORMATTERS
 * ============================================================================
 */
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
let compass = (deg) => (deg === null || deg === undefined) ? '' : COMPASS[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
let round = (v) => Math.round(Number(v) || 0);
let mm = (v) => (Number(v) || 0).toFixed(1).replace('.', ',');
let isNight = (ms) => { const h = Number(time.romeHour(ms)); return h >= 19 || h < 7; };

let rainLine = (e) => {
	let s = `☔️ ${round(e.rain_probability)}%`;
	if (Number(e.rain_fall) > 0) s += ` · ${mm(e.rain_fall)} mm`;
	return s;
};

let windLine = (e, short) => {
	let s;
	if (round(e.wind_speed) < 2) {
		s = '💨 Vento debole';
	} else {
		s = `💨 ${round(e.wind_speed)} km/h`;
		const dir = compass(e.wind_direction);
		if (dir) s += ` da ${dir}`;
	}
	if (Number(e.wind_gust) > 0) {
		s += short ? ` (raff. ${round(e.wind_gust)})` : ` · raffiche ${round(e.wind_gust)} km/h`;
	}
	return s;
};

let dailySummary = (e) => {
	const sky = getSky(e.sky_condition);
	const lines = [
		`${sky.emoji} <b>${sky.desc}</b>`,
		`🌡 min <b>${round(e.temperature_minimum)}°</b> · max <b>${round(e.temperature_maximum)}°</b>`,
		rainLine(e),
		windLine(e)
	];
	if (e.humidity !== undefined && e.humidity !== null) lines.push(`💧 Umidità ${round(e.humidity)}%`);
	if (e.sunshine_duration !== undefined) lines.push(`🔆 ${mm(e.sunshine_duration)} ore di sole`);
	if (Number(e.fresh_snow) > 0) lines.push(`❄️ Neve fresca ${round(e.fresh_snow)} cm`);
	lines.push(`🏔 Zero termico ${round(e.freezing_level)} m · neve oltre ${round(e.snow_level)} m`);
	return lines.join('\n');
};

let slotLine = (slot, expanded) => {
	const e = slot.entry;
	const sky = getSky(e.sky_condition, isNight(slot.start));
	const range = `<code>${time.romeHour(slot.start)}-${time.romeHour(slot.end)}</code>`;
	let s = `${range} ${sky.emoji} <b>${round(e.temperature)}°</b>  ${rainLine(e)}`;
	if (expanded) {
		s += `\n<i>${sky.desc}</i> · ${windLine(e, true)}`;
	}
	return s;
};

/**
 * ============================================================================
 *                           KEYBOARD
 * ============================================================================
 */
let buttonLabel = (day, now) => {
	if (day.isToday) return 'Oggi';
	if (day.date === time.romeDate(now + 24 * 3600000)) return 'Domani';
	return time.romeLabel(day.start, { weekday: 'short', day: 'numeric' });
};

let forecastKeyboard = (days, selected, expanded, now) => {
	const flag = expanded ? 1 : 0;
	const toggle = expanded
		? { text: '➖ Meno dettagli', callback_data: `W|${selected.date}|0` }
		: { text: '➕ Più dettagli', callback_data: `W|${selected.date}|1` };
	const refresh = { text: '🔄', callback_data: `W|${selected.date}|${flag}|r` };

	const dayButtons = days.map((d) => ({
		text: (d.date === selected.date ? '• ' : '') + buttonLabel(d, now),
		callback_data: `W|${d.date}|${flag}`
	}));
	const rows = [[toggle, refresh]];
	for (let i = 0; i < dayButtons.length; i += 4) rows.push(dayButtons.slice(i, i + 4));
	return { inline_keyboard: rows };
};

/**
 * ============================================================================
 *                          WEATHER MESSAGE
 * ============================================================================
 * @param place    { label, venueId, distanceKm }
 * @param date     'YYYY-MM-DD' (Europe/Rome) or falsy for today
 * @param expanded show text bulletin and per-slot details
 */
let BuildWeatherMessage = async (place, date, expanded) => {
	const venue = locations.getVenue(place.venueId);
	if (!venue) throw new Error(`unknown venue ${place.venueId}`);

	const [data, bulletins] = await Promise.all([
		API.GET_VenueForecast(venue.id),
		expanded ? API.GET_TextBulletins().catch(() => null) : null
	]);

	const now = Date.now();
	const layouts = time.parseLayouts(data);
	const days = buildDays(layouts, now);
	if (!days.length) throw new Error('empty forecast');
	const day = days.find((d) => d.date === date) || days[0];

	const slots = (layouts[THREE_HOURS] || [])
		.filter((s) => s.start >= day.start && s.start < day.end && s.end > now);

	let text = `📍 <b>${esc(place.label)}</b>\n`;
	text += `🗓 ${time.romeLabel(day.start, { weekday: 'long', day: 'numeric', month: 'long' })}`;
	if (venue.name !== place.label) {
		text += `\n<i>Punto di previsione: ${esc(venue.name)}`;
		if (place.distanceKm >= 1) text += ` (${round(place.distanceKm)} km)`;
		text += '</i>';
	}

	text += `\n\n${dailySummary(day.entry)}`;

	if (expanded) {
		const bulletin = pickBulletin(bulletins, day.id);
		if (bulletin) {
			text += `\n\n📝 <b>Bollettino ${bulletin.source}</b>\n<i>${esc(bulletin.text)}</i>`;
		}
	}

	if (slots.length) {
		text += `\n\n🕒 <b>${day.isToday ? 'Prossime ore' : 'Fasce orarie'}</b>\n`;
		text += slots.map((s) => slotLine(s, expanded)).join(expanded ? '\n\n' : '\n');
	}

	text += '\n\n<i>Fonte: Meteotrentino · meteo.report</i>';

	return {
		text,
		extra: {
			parse_mode: 'HTML',
			link_preview_options: { is_disabled: true },
			reply_markup: forecastKeyboard(days, day, expanded, now)
		}
	};
};

module.exports = {
	BuildWeatherMessage
};
