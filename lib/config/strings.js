const { esc } = require('../format');

let WELCOME = (name) => {
    return `Ciao ${esc(name || '')} 👋\n\n` +
        `@MeteoTrentinoBot ti tiene aggiornato su:\n\n` +
        `☀️ Previsioni per la tua località (7 giorni, fasce di 3 ore)\n` +
        `📝 Bollettino ufficiale Meteotrentino\n` +
        `🎧 Bollettino audio\n` +
        `⚡️ Radar precipitazioni e fulmini\n` +
        `⚠️ Allerte della Protezione Civile e bollettino valanghe\n` +
        `🌡 Dati in tempo reale delle stazioni meteo\n` +
        `🌬 Previsioni del vento sul Garda\n\n` +
        `➡️ <b>Per iniziare</b> scrivimi la tua <b>località</b> (es. <i>Arco</i>) oppure condividi la tua posizione 📡`;
};

let ASK_LOCATION = '📍 Scrivimi la località di cui vuoi le previsioni (es. <i>Pinzolo</i>), oppure condividi la tua posizione 📡';

let LOCATION_SAVED = (label) =>
    `✅ Fatto! <b>${esc(label)}</b> è la tua località.\n<i>Puoi cambiarla quando vuoi con 📍 Località o /cambialocalita.</i>`;

let LOCATION_SUGGEST = '🤔 Intendevi una di queste?';

let LOCATION_NOT_FOUND = '😕 Località non trovata.\nProva con il nome del comune (es. <i>Borgo Valsugana</i>) oppure condividi la tua posizione 📡';

let LOCATION_TOO_FAR = '😕 Sei un po\' lontano: il bot copre solo il Trentino. Scrivimi il nome di una località.';

let NO_LOCATION = '📍 Prima dimmi per quale località vuoi le previsioni!';

let ERROR = '😔 Il servizio meteo non risponde in questo momento. Riprova tra qualche minuto.';

let HELP = `❓ <b>AIUTO</b>

@MeteoTrentinoBot utilizza gli <i>open data</i> di Meteotrentino (Provincia Autonoma di Trento) pubblicati su meteo.report, gli stessi dell'app Meteo Trentino.

<b>Comandi</b>
/meteo – previsioni per la tua località
/radar – radar precipitazioni e fulmini
/allerte – avvisi della Protezione Civile
/stazioni – dati delle stazioni meteo
/vento – vento sul Garda
/audio – bollettino audio
/cambialocalita – cambia località
/gdpr – i dati che conservo su di te

💡 Nelle previsioni usa <b>➕ Più dettagli</b> per leggere il bollettino ufficiale e i dettagli di vento e zero termico, e i pulsanti dei giorni per spostarti nella settimana.

<b>F.A.Q.</b>
<b>La temperatura è diversa dal mio termometro.</b>
<i>Il bot riporta i dati ufficiali di Meteotrentino, non li produce. Le previsioni si riferiscono al punto di previsione più vicino alla tua località.</i>

<b>La mia località non è presente.</b>
<i>Prova con il nome del comune o condividi la tua posizione: verrà usato il punto di previsione più vicino.</i>

<b>Che dati vengono salvati?</b>
<i>Solo il minimo indispensabile (la località scelta e qualche contatore). Digita /gdpr per vederli.</i>

<b>Info</b>
Bot gratuito, <b>non ufficiale</b>, creato per passione. Disponibile anche come app sul Play Store: cerca "Meteo Trentino"!
Problemi o idee? Scrivimi su Telegram @Xiryl.

☕️ Vuoi supportare il progetto? <a href="https://www.paypal.me/fabiochiarani">Offrimi un caffè</a>!`;

module.exports = {
    WELCOME,
    ASK_LOCATION,
    LOCATION_SAVED,
    LOCATION_SUGGEST,
    LOCATION_NOT_FOUND,
    LOCATION_TOO_FAR,
    NO_LOCATION,
    ERROR,
    HELP
};
