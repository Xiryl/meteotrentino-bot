/**
 * ============================================================================
 *                      meteo.report TIME LAYOUTS
 * ============================================================================
 * Forecast/observation payloads are maps keyed by "layout id":
 *   layoutId = slotMinutes * 100000 + offsetMinutes
 * where offsetMinutes is relative to a reference instant (midnight UTC of
 * the publication day). `start` is the beginning of the earliest slot,
 * written as a naive Europe/Rome time. Everything here works on real UTC
 * instants (ms) and formats them back in Europe/Rome.
 */
const TZ = 'Europe/Rome';

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: TZ, hourCycle: 'h23',
	year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
});

let romeParts = (ms) => {
	const p = {};
	partsFormatter.formatToParts(new Date(ms)).forEach(({ type, value }) => { p[type] = value; });
	return p;
};

// offset of Europe/Rome from UTC at a given instant, in ms
let romeOffset = (ms) => {
	const p = romeParts(ms);
	return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - Math.floor(ms / 60000) * 60000;
};

let romeNaiveToUtc = (naive) => {
	const asUtc = Date.parse(naive.slice(0, 19) + 'Z');
	const guess = asUtc - romeOffset(asUtc);
	return asUtc - romeOffset(guess);
};

let romeDate = (ms) => { const p = romeParts(ms); return `${p.year}-${p.month}-${p.day}`; };
let romeHour = (ms) => romeParts(ms).hour;
let romeTime = (ms) => { const p = romeParts(ms); return `${p.hour}:${p.minute}`; };

let romeLabel = (ms, opts) => {
	const s = new Date(ms).toLocaleDateString('it-IT', { timeZone: TZ, ...opts });
	return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Returns every section of the payload ("30", "180", "1440", ...) as a
 * sorted list of { id, start, end, entry } with UTC instants.
 */
let parseLayouts = (data) => {
	const sections = Object.keys(data).filter((k) => /^\d+$/.test(k));
	let minOffset = Infinity;
	sections.forEach((minutes) => Object.keys(data[minutes]).forEach((id) => {
		minOffset = Math.min(minOffset, Number(id) - Number(minutes) * 100000);
	}));
	const reference = romeNaiveToUtc(data.start) - minOffset * 60000;

	const out = {};
	sections.forEach((minutes) => {
		const m = Number(minutes);
		out[minutes] = Object.entries(data[minutes])
			.map(([id, entry]) => {
				const start = reference + (Number(id) - m * 100000) * 60000;
				return { id: Number(id), start, end: start + m * 60000, entry };
			})
			.sort((a, b) => a.start - b.start);
	});
	return out;
};

module.exports = {
	romeDate,
	romeHour,
	romeTime,
	romeLabel,
	romeNaiveToUtc,
	parseLayouts
};
