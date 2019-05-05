let emoji = require('node-emoji');
const API = require('./API');

let BuildWeatherMessage = (loc) => new Promise((resolve, reject) => {
    API.GET_todayWeatherBullettin(loc).then( (body) => {
        console.log('*****')
        let tempMax = '';
		let tempMin = '';
		let desc    = '';
		let idIco 	= '';
		let dayEmoj = '';
        let message = '';
        
        try {
			// Save important values
			 tempMax = body.previsione[0].giorni[0].tMaxGiorno;
			 tempMin = body.previsione[0].giorni[0].tMinGiorno;
			 desc    = body.previsione[0].giorni[0].descIcona;
			 idIco 	= body.previsione[0].giorni[0].idIcona;
			 dayEmoj = '';
			 message = '';
		}
		catch (e) {
			return;
        }

        resolve(`Buongiorno \n\n${dayEmoj} A ${loc.toLowerCase()} il cielo oggi sarà *${desc.toLowerCase()}*.\n\n${emoji.get('thermometer')} Temperature tra *${tempMin}°* e *${tempMax}°*.`);  
    });
});

module.exports = {
    BuildWeatherMessage
}