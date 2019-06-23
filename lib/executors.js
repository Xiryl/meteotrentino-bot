const commands = require('./config/commands.js');
const localita = require('./config/localita.json');
let locs        = [''];

let fillLocs = () => {
	localita.localita.forEach((comune) => {
		locs.push(comune.comune.toLowerCase());
		locs.push(comune.localita.toLowerCase());
	});
}

let evalPosition = (pos) => new Promise((resolve, reject) => {
    if(locs.indexOf(pos.toLowerCase()) > -1 ) {
        resolve();
    }
    else{
        reject();
    }
 });

module.exports = {
    evalPosition,
    fillLocs
}