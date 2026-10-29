const API = require('./API');

let timestamp = () => new Date().toLocaleString('it-IT', {
	timeZone: 'Europe/Rome', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
});

/**
 * Wind forecast for Lake Garda (WRF meteograms, also shown in the app).
 */
let getGardaWind = async () => {
	const [riva, medio] = await Promise.all([
		API.GET_Media(API.MEDIA.WIND_RIVA),
		API.GET_Media(API.MEDIA.WIND_MEDIO)
	]);
	return [
		{ media: { source: riva, filename: 'vento_riva.png' }, extra: { caption: '🌬 <b>Vento Garda · Riva del Garda</b>\n<i>Meteogramma modello WRF Meteotrentino</i>', parse_mode: 'HTML' } },
		{ media: { source: medio, filename: 'vento_medio_garda.png' }, extra: { caption: '🌬 <b>Vento Garda · Medio Garda</b>\n<i>Meteogramma modello WRF Meteotrentino</i>', parse_mode: 'HTML' } }
	];
};

/**
 * Spoken summary of today's bulletin read by Meteotrentino forecasters.
 */
let getAudioBulletin = async () => ({
	media: { source: await API.GET_Media(API.MEDIA.AUDIO_BULLETIN), filename: 'bollettino-meteotrentino.mp3' },
	extra: {
		title: 'Bollettino meteo',
		performer: 'Meteotrentino',
		caption: `🎧 <b>Bollettino audio Meteotrentino</b>\n<i>Richiesto il ${timestamp()}</i>`,
		parse_mode: 'HTML'
	}
});

module.exports = {
	getGardaWind,
	getAudioBulletin
};
