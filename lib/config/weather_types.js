const soleggiatoConPioggia      = [112, 21, 121];
const soleggiatoConPioggiaNeve  = [14, 114, 117, 17, 20, 120, 122, 22, 23, 123, 124, 24];
const nevicata                  = [15, 115, 166, 16, 6, 106, 107, 7, 108, 8];
const sole                      = [18, 118];
const soleggiato                = [11, 111, 125, 25, 126, 26];
const coperto                   = [19, 119];
const copertoPioggia            = [1, 101, 102, 2, 13, 12];
const copertoPioggiaAbbondante  = [3, 103, 104, 4, 803, 903, 113];
const copertoPioggiaNeve        = [5, 105, 109, 9, 110, 10];
const temporale                 = [821];


let getEmojFromIconId = (idIco, emoji) => {

    let dayEmoj = '';

    // Find wich emoj corrispond to icon
    if (soleggiatoConPioggia.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('partly_sunny_rain');
    }
    else if (soleggiatoConPioggiaNeve.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('partly_sunny_rain') + emoji.get('snowflake');
    }
    else if (nevicata.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('cloud') + emoji.get('snow_cloud');
    }
    else if (sole.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('sunny');
    }
    else if (soleggiato.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('barely_sunny');
    }
    else if (coperto.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('cloud');
    }
    else if (copertoPioggia.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('cloud') + emoji.get('rain_cloud');
    }
    else if (copertoPioggiaAbbondante.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('rain_cloud') + emoji.get('rain_cloud');
    }
    else if (copertoPioggiaNeve.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('rain_cloud') + emoji.get('snow_cloud');
    }
    else if (temporale.indexOf(idIco) > -1) {
        dayEmoj += emoji.get('zap') + emoji.get('rain_cloud');
    }
    else {
        dayEmoj += '' ;
    }

    return dayEmoj;

}
module.exports = {
    getEmojFromIconId,
    soleggiatoConPioggia,
    soleggiatoConPioggiaNeve,
    nevicata,
    sole,
    soleggiato,
    coperto,
    copertoPioggia,
    copertoPioggiaAbbondante,
    copertoPioggiaNeve,
    temporale
}