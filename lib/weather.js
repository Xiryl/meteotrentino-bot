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
		let allerta = '';
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

		if(body.previsione[0].giorni[0].descIconaAllerte) {
			forecast += `\n\n${emoji.get('warning')} *ALLERTA*: ${body.previsione[0].giorni[0].descIconaAllerte.toUpperCase()} ${emoji.get('warning')}`;
		}
	
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

		const inlineKeyboard = keyboard.getInlineKeyboardMore(new Date(body.previsione[0].giorni[0].giorno));

        resolve({forecast: forecast, keyboard: inlineKeyboard});  
	});
});


let BuildFullWeatherMessage = (loc) => new Promise((resolve, reject) => {
    API.GET_todayWeatherBullettin(loc).then( (body) => {

		let tempMax = ''; 
		let localita = '';
		let tempMin = '';
		let desc    = '';
		let idIco 	= '';
		let allerta = '';
		let dayEmoj = '';
		let message = '';
		let giorno  = '';

        try {
			// Save important values
			 tempMax	= body.previsione[0].giorni[0].tMaxGiorno;
			 tempMin	= body.previsione[0].giorni[0].tMinGiorno;
			 desc		= body.previsione[0].giorni[0].descIcona;
			 idIco		= body.previsione[0].giorni[0].idIcona;
			 localita 	= body.previsione[0].localita;
			
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
		forecast += `${emoji.get('round_pushpin')} Previsioni per **${localita}** (${giorno}):`;
		forecast += `\n\n•**Descrizione**: ${desc}`;

		if(body.previsione[0].giorni[0].descIconaAllerte) {
			forecast += `\n\n${emoji.get('warning')} *ALLERTA*: ${body.previsione[0].giorni[0].descIconaAllerte.toUpperCase()} ${emoji.get('warning')}`;
		}

		forecast += `\n\n•**Testo**: _${body.previsione[0].giorni[0].testoGiorno}_`
	
		// cycle 4 available time slots
		body.previsione[0].giorni[0].fasce.forEach((timeslot) => {
			let tmp = timeslot.icona.split('_');
			let idIco = parseInt(tmp[1].substring(0, 3));
			let emojWeather = weatherTypes.getEmojFromIconId(idIco, emoji);

			forecast += `\n\n${emojWeather} *${stringHelper.capitalizeFirstLetter(timeslot.fasciaPer)}* (h ${timeslot.fasciaOre}):`;
			forecast += `\n•Descrizione: _${timeslot.descIcona}_`;
			forecast += `\n•Prob. Prec.: _${timeslot.descPrecProb}_`;
			forecast += `\n•Intensità Prec.: _${timeslot.descPrecInten}_`;
			forecast += `\n•Prob. Temporali: _${timeslot.descTempProb}_`;
			forecast += `\n•Vento in quota: _${timeslot.descVentoIntQuota}_`;
			forecast += `\n•Dir. Vento in quota: _${timeslot.descVentoDirQuota}_`;
			forecast += `\n•Vento in valle: _${timeslot.descVentoIntValle}_`;
			forecast += `\n•Dir. Vento in valle: _${timeslot.descVentoDirValle}_`;
			forecast += `\n•Zero termico: _${timeslot.zeroTermico}_`;
		});

		forecast += `\n\n${emoji.get('thermometer')} Temperature tra *${tempMin}°* e *${tempMax}°*`;

		const inlineKeyboard = keyboard.getInlineKeyboardLess(new Date(body.previsione[0].giorni[0].giorno));
	
        resolve({forecast: forecast, keyboard: inlineKeyboard, day: body.previsione[0].giorni[0].giorno});  
	});
});

module.exports = {
	BuildWeatherMessage,
	BuildFullWeatherMessage
}