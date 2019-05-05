const p = require('phin');

function getAllDataFromMeteoTrentino(loc, callback) {

	// Create options for the request
	let options = {
		method: 'GET',
		url: `https://www.meteotrentino.it/protcivtn-meteo/api/front/previsioneOpenDataLocalita?localita=${loc}`,
		headers: {
			'Content-Type': 'application/json'
		},
		parse: 'json'
	};

	// Send the request
	p(options, (error, response) => {
		if (error) {
			callback(error);
		}
		else if (response.statusCode == 200) {
		//	console.log('Dati da meteotrentino accquisiti');
			// Return data
			callback(null, response.body);
		}
		else {
			// Any error here
			callback(error);
		}
	});
}