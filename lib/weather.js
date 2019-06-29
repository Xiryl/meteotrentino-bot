let   emoji 		= require('node-emoji');
const API 			= require('./API');
const dayConverter 	= require('./dayConverter');
const weatherTypes 	= require('./config/weather_types');
const stringHelper 	= require('./stringHelper')
const keyboard 		= require('./config/keyboards')

/**
 * ============================================================================
 *           		         WEATHER MESSAGE 
 * ============================================================================
 */
let BuildWeatherMessage = (loc, customDay) => new Promise((resolve, reject) => {
    API.GET_todayWeatherBullettin(loc).then( (body) => {

		let tempMax 	= ''; 
		let localita 	= '';
		let tempMin 	= '';
		let giorno  	= '';

		body.previsione[0].giorni.forEach( day => {
			try {
				// Save important values
				 tempMax	= day.tMaxGiorno;
				 tempMin	= day.tMinGiorno;
				 desc		= day.descIcona;
				 idIco		= day.idIcona;
				 localita = body.previsione[0].localita;
				 giorno = dayConverter.dayFromDate(day.giorno);
				 giorno += " " + day.giorno.split('-')[2];

				 dayEmoj	= '';
				 message	= '';
			}
			catch (e) {
				reject('Errore Durante il ricevimento dei dati');
				return;
			}


			let forecast = '';
			forecast = `${emoji.get('round_pushpin')} Previsioni per *${localita}* (${giorno}):`;

			if(day.descIconaAllerte) {
				forecast += `\n\n${emoji.get('warning')} *ALLERTA*: ${day.descIconaAllerte.toUpperCase()} ${emoji.get('warning')}`;
			}
		
			// cycle 4 available time slots
			day.fasce.forEach((timeslot) => {
				let tmp = timeslot.icona.split('_');
				let idIco = parseInt(tmp[1].substring(0, 3));
				let emojWeather = weatherTypes.getEmojFromIconId(idIco, emoji);

				forecast += `\n\n${emojWeather} *${stringHelper.capitalizeFirstLetter(timeslot.fasciaPer)}* (h ${timeslot.fasciaOre}):`;
				forecast += `\n•Desc: _${timeslot.descIcona}_`;
				forecast += `\n•Prob. Prec.: _${timeslot.descPrecProb}_`;
				forecast += `\n•Zero Temico: _${timeslot.zeroTermico}_`;
			});

			forecast += `\n\n${emoji.get('thermometer')} Temperature tra *${tempMin}°* e *${tempMax}°*`;

			const inlineKeyboard = keyboard.getInlineKeyboardMore(new Date(body.previsione[0].giorni[0].giorno), new Date(day.giorno));

			if(customDay) {
				if(convertNumber(customDay) === giorno.split(' ')[1])  {
					resolve({forecast: forecast, keyboard: inlineKeyboard});  
					console.log('cmday-' + customDay + '-' + giorno);
				}
				else {
					console.log('cmdayDiverso-' + customDay + '-' + giorno);
				}
			}
			else {
				resolve({forecast: forecast, keyboard: inlineKeyboard});  
				console.log('NoCmday-');
			}
		});
	});
});


let convertNumber = (n) => {
    return n > 9 ? "" + n: "0" + n;
}

/**
 * ============================================================================
 *           		    WEATHER MESSAGE (big version)
 * ============================================================================
 */
let BuildFullWeatherMessage = (loc, customDay) => new Promise((resolve, reject) => {
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

		body.previsione[0].giorni.forEach( day => {
			try {
				// Save important values
				 tempMax	= day.tMaxGiorno;
				 tempMin	= day.tMinGiorno;
				 desc		= day.descIcona;
				 idIco		= day.idIcona;
				 localita 	= body.previsione[0].localita;
				
				 giorno = dayConverter.dayFromDate(day.giorno);
				 giorno += " " + day.giorno.split('-')[2];
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
	
			if(day.descIconaAllerte) {
				forecast += `\n\n${emoji.get('warning')} *ALLERTA*: ${day.descIconaAllerte.toUpperCase()} ${emoji.get('warning')}`;
			}
	
			forecast += `\n\n•**Testo**: _${day.testoGiorno}_`
		
			// cycle 4 available time slots
			day.fasce.forEach((timeslot) => {
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
	
			const inlineKeyboard = keyboard.getInlineKeyboardLess(new Date(body.previsione[0].giorni[0].giorno), new Date(day.giorno));

			if(customDay) {
				if(convertNumber(customDay) === giorno.split(' ')[1])  {
					resolve({forecast: forecast, keyboard: inlineKeyboard});  
				}
				else {
				}
			}
			else {
				resolve({forecast: forecast, keyboard: inlineKeyboard});  
			}
		});
	});
});

module.exports = {
	BuildWeatherMessage,
	BuildFullWeatherMessage
}