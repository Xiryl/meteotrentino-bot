const p = require('phin').unpromisified;
const fs = require('fs');

/**
 * ============================================================================
 *                  		  WEATHER DAILY MESSAGE
 * ============================================================================
 */
let GET_todayWeatherBullettin = (loc) => new Promise((resolve, reject) => {
    console.log(loc);

	let options = {
		method: 'GET',
		url: `https://www.meteotrentino.it/protcivtn-meteo/api/front/previsioneOpenDataLocalita?localita=${loc}`,
		headers: {
			'Content-Type': 'application/json'
		},
		parse: 'json'
	};

    p(options, (error, response) => {
		if (error) {
			reject(error);
        }
        
		else if (response.statusCode == 200) {
			resolve(response.body);
		}
		else {
			reject(error);
		}
	});
});


/**
 * ============================================================================
 *                  			  ALERT LIST
 * ============================================================================
 */
let GET_AlertsList = () => new Promise((resolve, reject) => {
	let options = {
		method: 'GET',
		url: `http://avvisi.protezionecivile.tn.it/elencoavvisi.aspx`
	};

    p(options, (error, response) => {
		if (error) {
			reject(error);
        }
        
		else if (response.statusCode == 200) {
			resolve(response.body);
		}
		else {
			reject(error);
		}
	});
});

/**
 * ============================================================================
 *                			  RADAR IMAGE
 * ============================================================================
 */
let GET_MeteoTrentinoRadarImage = () => new Promise((resolve, reject) => {
	let options = {
		method: 'GET',
		url: `https://content.meteotrentino.it/dati-meteo/radar/home/lastRadar4mobile.aspx`,
		headers: {
			'Content-Type': 'image/gif'
		}
	};

    p(options, (error, response) => {
		if (error) {
			reject(error);
        }
        
		else if (response.statusCode == 200) {

			let buffers = response.body;

			let dir = './octet-stream';

			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			let tmpDate = new Date();
			let tmpTime = tmpDate.getTime();
			let tmpPath = 'octet-stream/' + tmpTime + '.gif';
			fs.writeFileSync(tmpPath, buffers);

			resolve(tmpPath);
		}
		else {
			reject(error);
		}
	});
});


/**
 * ============================================================================
 *                         STATION WEATHER DATA
 * ============================================================================
 */
let GET_WeatherStationData = (code) => new Promise((resolve, reject) => {
	let options = {
		method: 'GET',
		url: `http://dati.meteotrentino.it/service.asmx/ultimiDatiStazione?codice=${code}`,
		headers: {
			'Content-Type': 'application/xml'
		}
	};

    p(options, (error, response) => {
		if (error) {
			reject(error);
        }
        
		else if (response.statusCode == 200) {
			resolve(response.body);
		}
		else {
			reject(error);
		}
	});
});


module.exports = {
	GET_todayWeatherBullettin,
	GET_AlertsList,
	GET_MeteoTrentinoRadarImage,
	GET_WeatherStationData
}
