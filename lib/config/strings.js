let WELCOME = (name) => {
    return `Ciao ${name} 😉!\n\n@MeteoTrentinoBot ti permetterà di essere sempre aggiornato su:\n\n_•Bollettino meteorologico (vista veloce)\n•Bollettino meteorologico (vista completa)\n•Immagini Radar e Satellitari\n•Allerte della Protezione Civile/PAT\n•Dati real-time sui sensori (compresi dighe e bacini)\n•Molto Altro!_\n\n➡️ *Per iniziare*, scrivimi la *località* su cui vuoi ricevere gli aggiornamenti (_Es. Arco_)! \n\nPer saperne di più digita /help`
}

let OPTIONS = `⚙️ OPZIONI DISPONIBILI\n\n•Cambia la località di default digitando /cambialocalita\n`;

let HELP = `❓*HELP E F.A.Q.*\n\n@MeteoTrentinoBot utilizza i dati metereologici forniti dalla PAT (in particolare gli _opendata_).\n\n*Cosa puoi fare con il bot?*
\n️➡️ Immagini radar e stellitari
\n➡️ Allerte emanate dalla PAT/Protezione civile di Trento
\n➡️ Visualizzare le letture dei dati sulle stazioni metereologiche nel nostro territorio
\n️➡️ Visualizzare le letture di tutti i sensori disponibili lungo i bacini nel nostro territorio
\n🔥Disponibile anche in formato app sul playstore, cercami come "Meteo Trentino"!
\n\n
*F.A.Q.*:
\n_Ricevo molto spesso domande e/o affermazioni sul bot, ho quindi deciso di inserire una sezione di F.A.Q._
\n-*La temperatura riportata è sbagliata rispetto al mio termometro di casa. Il bot non funziona.*
\n_Il bot si occupa solo di essere da intermediario tra i dati forniti dalla PAT e/o i sensori letti dalle stazioni metereologiche. Il bot non si occupa di creare tali dati!_
\n-*La mia località non è presente.*
\n_Il bot funziona solo con le località supportate da www.meteotrentino.it. Se la località non è supportata dal sito ufficiale, nemmeno qua lo sarà._
\n-*Il radar non funziona.*
\n_Spesso il radar di www.meteotrentino.it è in manutenzione, questo provoca un disservizo. Sono state quindi inserite nuove immagini radar presenti sul sito www.sat24.com_
\n-*Che dati vengono salvati? E la privacy?.*
\n_Vengono salvati i minimi dati possibili per fare in modo che il bot funzioni correttamente e nel modo più semplice possibile. Vuoi sapere che dati sono salvati? digita /gdpr._
\n\n
*Info*:
\nQuesto è un bot totalmente gratuito e trasparente. *Non è un bot ufficiale della PAT*. E' stato creato per pura passione.
Vorresti una features implementata? Hai dei problemi col bot? Scrivimi su telegram @Xiryl. 
\n\n
*☕️ Supporto*:
\nVuoi supportare il progetto? Offri un caffè in maniera rapida e sicura tramite [paypal](https://www.paypal.me/fabiochiarani)!
`;

let MAINTENANCE = `🛠️ *Manutenzione in corso*

Il bot è in manutenzione e tornerà nei prossimi giorni.
Sarà presto di nuovo disponibile a qualsiasi comando, messaggio o risposta.

Grazie per la pazienza!`;

module.exports = {
    WELCOME,
    OPTIONS,
    HELP,
    MAINTENANCE
}
