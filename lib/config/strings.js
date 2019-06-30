let WELCOME = (name) => {
    return `Ciao ${name} 😉!\n\nGrazie a @MeteoTrentinoBot sarai sempre aggiornato su:\n\n_•Bollettino metereologico (vista veloce)\n•Bollettino Metereologico (vista completa)\n•Immagini Radar e Satellitari\n•Allerte della Protezione Civile/PAT\n•Dati real-time sui sensori (compresi dighe e bacini)\n•Molto Altro!_\n\n➡️ *Per iniziare*, scrivimi la tua *località* su cui vuoi ricevere gli aggiornamenti (_Es Arco_)! \n\nPer saperne di più digita /help`
}

let OPTIONS = `⚙️ OPZIONI DISPONIBILI\n\n•Cambia località default digitando /cambialocalita\n\nIn fase di sbiluppo:\n•Bollettino metereologico automatico ogni mattino`;

let HELP = `❓*HELP E F.A.Q.*\n\n@MeteoTrentinoBot utilizza i dati metereologici forniti dalla PAT (nel particolare gli _opendata_).\n\n*Cosa puoi fare con il bot?*
\n•Ricevere bollettino metereologico (versione completa o ridotta)
\n•Visualizzare immagini radar e satellitari
\n•Visualizzare le allerte emanate dalla PAT/Protezione civile di Trento
\n•Visualizzare le letture dei dati sulle stazioni metereologiche nel nostro territorio
\n•Visualizzare le letture di tutti i sensori disponibili lungo i bacini del nel nostro territorio
\n•Ricevere notifiche su nuove allerte emanate
\n•Ricevere un bollettino metereologico oggni mattina a un ora custom (_in fase di sviluppo_)
\n\n
*F.A.Q.*:
\n_Ricevo molto spesso domande e/o affermazioni sul bot, ho quindi deciso di inserire una sezone di F.A.Q._
\n-*La temperatura riportata è sbagliata rispetto al mio termometro di casa. Il bot non funziona.*
\n_Il bot si occupa solo di essere da intermediario tra i dati forniti dalla PAT e/o i sensori letti dalle stazioni metereologiche. Il bot non si occupa di creare tali dati!_
\n-*La mia località non è presente.*
\n_Il bot funziona con solo le località supportate da www.meteotrentino.it. Se la tua località non è supportata dal sito ufficiale, nemmeno qua lo sarà._
\n-*Il radar non funziona.*
\n_Spesso il radar di www.meteotrentino.it è in manutenzione, questo provoca un disservizo. Sono state quindi inserite nuove immagini radar presenti sul sito www.sat24.com_
\n-*Che dati vengono salvati? E la privacy?.*
\n_Vengono salvati i minimi dati possibili per far si che il bot funzioni correttamente e nel modo più semplice possibile. Vuoi sapere che dati salviamo? digita /gdpr._
\n\n
*Info*:
\nQuesto è un bot totalmente gratuito e trasparente. *Non è un bot ufficiale della PAT*. Sono uno sviluppatore solo e l'ho creato per pura passione.
Vorresti una features implementata? hai dei problemi col bot? scrivimi al mio profilo telegram @Xiryl. Il bot è _open source_ sul mio profilo [github](www.github.com/Xiryl). 
\n\n
*☕️ Supporto*:
\nVuoi aiutare a mantere il progetto? Offrimi un caffè in maniera rapida e sicura da [qua](https://www.paypal.me/fabiochiarani)!
`;

module.exports = {
    WELCOME,
    OPTIONS,
    HELP
}