let dayFromDate = ( date ) => {
    const dateObj = new Date(date);
    const day = dateObj.getDay();

    switch ( day ) {
        case 0 : return 'DOM';
        case 1 : return 'LUN';
        case 2 : return 'MAR';
        case 3 : return 'MER';
        case 4 : return 'GIO';
        case 5 : return 'VEN';
        case 6 : return 'SAB';
        default : return 'ERR';
    }
}

module.exports = { dayFromDate };