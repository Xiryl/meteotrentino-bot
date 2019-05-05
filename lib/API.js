const p = require('phin').unpromisified;

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

module.exports = {
    GET_todayWeatherBullettin
}
