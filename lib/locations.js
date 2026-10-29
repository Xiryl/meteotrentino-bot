const localita = require('./config/localita.json');
const venues   = require('./config/venues.json');

/**
 * ============================================================================
 *                          LOCATION -> FORECAST VENUE
 * ============================================================================
 * meteo.report publishes forecasts for a fixed set of Trentino "venues"
 * (comuni and località, open data list used by the app). The user can type
 * a venue name or any locality known to meteotrentino (localita.json, with
 * coordinates): we pick the venue itself or the closest one.
 */

let normalize = (value) => (value || '')
	.normalize('NFD')
	.replace(/\p{M}+/gu, '')
	.replace(/[’'`]/g, '')
	.replace(/[^a-zA-Z0-9]+/g, ' ')
	.trim()
	.toLowerCase();

let titleCase = (value) => value
	.toLowerCase()
	.replace(/(^|[\s'’(-])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase());

let distanceKm = (lat1, lon1, lat2, lon2) => {
	const rad = Math.PI / 180;
	const dLat = (lat2 - lat1) * rad;
	const dLon = (lon2 - lon1) * rad;
	const a = Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
	return 12742 * Math.asin(Math.sqrt(a));
};

const venueById = new Map(venues.map((v) => [v.id, v]));

// searchable entries: forecast venues first, then meteotrentino localities
const places = [];
venues.forEach((v) => places.push({
	key: normalize(v.name), label: v.name, lat: v.lat, lon: v.lon, venue: v
}));
const venueKeys = new Set(places.map((p) => p.key));
localita.localita.forEach((l) => {
	// the forecast venue with the same name wins
	if (venueKeys.has(normalize(l.localita))) return;
	const label = l.localita === l.comune
		? titleCase(l.localita)
		: `${titleCase(l.localita)} (${titleCase(l.comune)})`;
	places.push({
		key: normalize(l.localita),
		comuneKey: normalize(l.comune),
		label,
		lat: parseFloat(l.latitudine),
		lon: parseFloat(l.longitudine)
	});
});

let nearest = (items, lat, lon) => {
	let best = null;
	let bestDist = Infinity;
	items.forEach((v) => {
		const d = distanceKm(lat, lon, v.lat, v.lon);
		if (d < bestDist) {
			best = v;
			bestDist = d;
		}
	});
	return { item: best, distanceKm: bestDist };
};

let toResult = (place) => {
	if (place.venue) {
		return { label: place.label, venue: place.venue, distanceKm: 0 };
	}
	const near = nearest(venues, place.lat, place.lon);
	return { label: place.label, venue: near.item, distanceKm: near.distanceKm };
};

/**
 * Resolves free text.
 * @returns {{ match: object|null, suggestions: string[] }}
 */
let resolve = (text) => {
	const q = normalize(text);
	if (!q) return { match: null, suggestions: [] };

	const exact = places.find((p) => p.key === q) || places.find((p) => p.comuneKey === q);
	if (exact) return { match: toResult(exact), suggestions: [] };

	// accept a previously suggested label, e.g. "Maiere (Ala)"
	const byLabel = places.find((p) => normalize(p.label) === q);
	if (byLabel) return { match: toResult(byLabel), suggestions: [] };

	const starts   = places.filter((p) => p.key.startsWith(q));
	const contains = places.filter((p) => !p.key.startsWith(q) && p.key.includes(q));
	const seen = new Set();
	const suggestions = [...starts, ...contains]
		.filter((p) => {
			const k = normalize(p.label);
			if (seen.has(k)) return false;
			seen.add(k);
			return true;
		})
		.map((p) => p.label)
		.slice(0, 8);

	if (suggestions.length === 1) {
		return resolve(suggestions[0]);
	}
	return { match: null, suggestions };
};

/**
 * Resolves GPS coordinates (shared location) to the closest venue.
 */
let resolveCoordinates = (lat, lon) => {
	const near = nearest(venues, lat, lon);
	return { label: near.item.name, venue: near.item, distanceKm: near.distanceKm };
};

let getVenue = (id) => venueById.get(id);

module.exports = {
	normalize,
	nearest,
	resolve,
	resolveCoordinates,
	getVenue
};
