/**
 * ============================================================================
 *                 meteo.report sky_condition code -> description
 * ============================================================================
 * Descriptions are the official Italian ones published by meteo.report.
 */
const SKY = {
	a: { desc: 'Cielo sereno',                   day: '☀️', night: '🌙' },
	b: { desc: 'Soleggiato',                     day: '🌤', night: '🌙' },
	c: { desc: 'Parzialmente nuvoloso',          day: '⛅️', night: '☁️' },
	d: { desc: 'Nuvoloso',                       day: '🌥', night: '☁️' },
	e: { desc: 'Molto nuvoloso',                 day: '☁️' },
	f: { desc: 'Rovesci',                        day: '🌦', night: '🌧' },
	g: { desc: 'Rovesci forti',                  day: '🌧' },
	h: { desc: 'Pioggia moderata',               day: '🌧' },
	i: { desc: 'Pioggia forte',                  day: '🌧' },
	j: { desc: 'Pioggia debole',                 day: '🌂' },
	k: { desc: 'Rovesci deboli',                 day: '🌦', night: '🌂' },
	l: { desc: 'Neve debole e sole',             day: '🌨' },
	m: { desc: 'Neve e sole',                    day: '🌨' },
	n: { desc: 'Neve debole',                    day: '🌨' },
	o: { desc: 'Neve moderata',                  day: '❄️' },
	p: { desc: 'Neve forte',                     day: '❄️' },
	q: { desc: 'Neve bagnata e sole',            day: '🌨' },
	r: { desc: 'Neve bagnata',                   day: '🌨' },
	s: { desc: 'Foschia',                        day: '🌫' },
	t: { desc: 'Foschia in quota',               day: '🌫' },
	u: { desc: 'Instabile',                      day: '🌦' },
	v: { desc: 'Temporali',                      day: '⛈' },
	w: { desc: 'Instabile con neve bagnata',     day: '🌨' },
	x: { desc: 'Temporali di neve bagnata',      day: '⛈' },
	y: { desc: 'Instabile con temporali nevosi', day: '⛈' },
	z: { desc: 'Temporali nevosi',               day: '⛈' }
};

let getSky = (code, isNight) => {
	const sky = SKY[(code || '').toLowerCase()];
	if (!sky) return { desc: 'n.d.', emoji: '🌡' };
	return { desc: sky.desc, emoji: (isNight && sky.night) || sky.day };
};

module.exports = { getSky };
