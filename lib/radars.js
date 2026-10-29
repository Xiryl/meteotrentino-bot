const API = require('./API');

const LINKS = {
	radar:     'https://www.meteotrentino.it/dati/radar/',
	moviola3h: 'https://www.meteotrentino.it/dati/radar/radar-moviola-3h/',
	moviola24: 'https://www.meteotrentino.it/dati/radar/radar-moviola-24h/',
	grandine:  'https://www.meteotrentino.it/dati/radar/grandine/',
	fulmini:   'https://www.meteotrentino.it/dati/meteo/fulmini/',
	nazionale: 'https://mappe.protezionecivile.it/it/mappe-e-dashboard-rischi/piattaforma-radar/'
};

let timestamp = () => new Date().toLocaleTimeString('it-IT', {
	timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit'
});

/**
 * Radar mosaic animation (mp4, sent as Telegram animation).
 */
let getRadar = async () => ({
	media: { source: await API.GET_Media(API.MEDIA.RADAR_MOSAIC), filename: 'radar.mp4' },
	extra: {
		caption: `🛰 <b>Radar precipitazioni</b> · aggiornato alle ${timestamp()}\n<i>Mosaico radar Meteotrentino</i>`,
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: [
				[{ text: '⏪ Ultime 3h', url: LINKS.moviola3h }, { text: '⏪ Ultime 24h', url: LINKS.moviola24 }],
				[{ text: '🧊 Grandine', url: LINKS.grandine }, { text: '🇮🇹 Radar Italia', url: LINKS.nazionale }]
			]
		}
	}
});

/**
 * Lightning animation (gif).
 */
let getRadarFulmini = async () => ({
	media: { source: await API.GET_Media(API.MEDIA.LIGHTNING_ANIM), filename: 'fulmini.gif' },
	extra: {
		caption: `⚡️ <b>Fulminazioni</b> · aggiornato alle ${timestamp()}\n<i>Rete Lampinet</i>`,
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: [[{ text: '🌐 Mappa fulmini', url: LINKS.fulmini }]]
		}
	}
});

module.exports = {
	getRadar,
	getRadarFulmini
};
