const API = require('./API');

let getRadar = () => new Promise( (resolve, reject) => {
    API.GET_MeteoTrentinoRadarImage().then( (path) => {
        resolve(path);
    });
});


let getRadarFulmini = () => new Promise( (resolve, reject) => {
    API.GET_MeteoTrentinoRadarFulminiImage().then( (path) => {
        resolve(path);
    });
});

module.exports = {
    getRadar,
    getRadarFulmini
}