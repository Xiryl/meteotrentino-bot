let   emoji = require('node-emoji');
const API = require('./API');
const dayConverter = require('./dayConverter');
const weatherTypes = require('./config/weather_types');
const stringHelper = require('./stringHelper')
const keyboard = require('./config/keyboards')

let BuildWeatherMessage = (loc) => new Promise((resolve, reject) => {
    API.GET_todayWeatherBullettin(loc).then( (body) => {

		let tempMax = ''; 
		let localita = '';
		let tempMin = '';
		let desc    = '';
		let idIco 	= '';
		let dayEmoj = '';
		let message = '';
		let giorno  = '';

        try {
			// Save important values
			 tempMax	= body.previsione[0].giorni[0].tMaxGiorno;
			 tempMin	= body.previsione[0].giorni[0].tMinGiorno;
			 desc		= body.previsione[0].giorni[0].descIcona;
			 idIco		= body.previsione[0].giorni[0].idIcona;
			 localita = body.previsione[0].localita;
			 giorno = dayConverter.dayFromDate(body.previsione[0].giorni[0].giorno);
			 giorno += " " + body.previsione[0].giorni[0].giorno.split('-')[2];
			 dayEmoj	= '';
			 message	= '';
		}
		catch (e) {
			reject('Errore Durante il ricevimento dei dati');
			return;
        }

		let forecast = '';
		forecast = `${emoji.get('round_pushpin')} Previsioni per *${localita}* (${giorno}):`;
	
		// cycle 4 available time slots
		body.previsione[0].giorni[0].fasce.forEach((timeslot) => {
			let tmp = timeslot.icona.split('_');
			let idIco = parseInt(tmp[1].substring(0, 3));
			let emojWeather = weatherTypes.getEmojFromIconId(idIco, emoji);

			forecast += `\n\n${emojWeather} *${stringHelper.capitalizeFirstLetter(timeslot.fasciaPer)}* (h ${timeslot.fasciaOre}):`;
			forecast += `\n•Desc: _${timeslot.descIcona}_`;
			forecast += `\n•Prob. Prec.: _${timeslot.descPrecProb}_`;
			forecast += `\n•Zero Temico: _${timeslot.zeroTermico}_`;
		});

		forecast += `\n\n${emoji.get('thermometer')} Temperature tra *${tempMin}°* e *${tempMax}°*`;

		const inlineKeyboard = keyboard.getInlineKeyboard(new Date(body.previsione[0].giorni[0].giorno));

        resolve({forecast: forecast, keyboard: inlineKeyboard});  
	});
});

module.exports = {
    BuildWeatherMessage
}