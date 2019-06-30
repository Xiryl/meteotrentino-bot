const Markup        = require('telegraf/markup');
const API           = require('./API');
const keyboard      = require('./config/keyboards');
const bacinij = require('./config/bacini.json');
const csv = require('csv-parser');
const fs = require('fs');

/**
 * ============================================================================
 *           		    MAKE STATION LIST AS KEYBOARD 
 * ============================================================================
 */
let getStationAndSensorsNamesAsKeyboard = (bacinoType) => {
    let arr = [];

    arr.push(['❌ Annulla']);
    console.log('....' + bacinoType);
    bacinij[`${bacinoType}`].stazioni.forEach(stazione => {
       arr.push([`${stazione.nome_stazione}`]);
    });

   return sensorTypesKeyboard = Markup.keyboard( 
    arr
    )
      .oneTime()
      .resize()
      .extra();
};

/**
 * ============================================================================
 *           		    MAKE STATION LIST AS KEYBOARD 
 * ============================================================================
 */
let getSensorsData = (bacinoType, stationType, ctx) => new Promise( (resolve, reject) => {

    let availables = `Lista dei sensori disponibili per *${bacinoType.toUpperCase()}(${stationType.toUpperCase()})*:\n`;
    bacinij[`${bacinoType}`].stazioni.forEach(stazione => {
        if(stationType === stazione.nome_stazione) {
             if(stazione.sensori.pluviometro.id_sensore > 0 ) {
                availables += `\n✅ Pluviometro`;
             }else {availables += `\n❌ Pluviometro`;}
             if(stazione.sensori.idrometro.id_sensore > 0 ) {
                availables += `\n✅ Idrometro`;
             }else {availables += `\n❌ Idrometro`;}
             if(stazione.sensori.temperatura_aria.id_sensore > 0 ) {
                availables += `\n✅ Temperatura Aria`;
             }else {availables += `\n❌ Temperatura Aria`;}
             if(stazione.sensori.igrometro.id_sensore > 0 ) {
                availables += `\n✅ Igrometro`;
             }else {availables += `\n❌ Igrometro`;}
             if(stazione.sensori.nivometro.id_sensore > 0 ) {
                availables += `\n✅ Nivometro`;
             }else {availables += `\n❌ Nivometro`;}
             if(stazione.sensori.barometro.id_sensore > 0 ) {
                availables += `\n✅ Barometro`;
             }else {availables += `\n❌ Barometro`;}
             if(stazione.sensori.radiometro.id_sensore > 0 ) {
                availables += `\n✅ Radiometro`;
             }else {availables += `\n❌ Radiometro`;}
             if(stazione.sensori.vento.id_sensore > 0 ) {
                availables += `\n✅ Vento`;
             }else {availables += `\n❌ Vento`;}
             if(stazione.sensori.direzione_vento.id_sensore > 0 ) {
                availables += `\n✅ Direzione Vento`;
             }else {availables += `\n❌ Direzione Vento`;}
             if(stazione.sensori.portata.id_sensore > 0 ) {
                availables += `\n✅ Portata`;
             }else {availables += `\n❌ Portata`;}

             availables += `\n\n_Attenzione: Riceverai un messaggio per sensore in base alla sua velocità di risposta._`
             ctx.replyWithMarkdown(availables);
         }
     });

    bacinij[`${bacinoType}`].stazioni.forEach(stazione => {
       if(stationType === stazione.nome_stazione) {
            if(stazione.sensori.pluviometro.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.pluviometro.api_pluviometro).then( (path) => {
                let response = `\n✅ Pluviometro`;
                response += '\n\n_Formato dati: Ora - Valore [mm/h] - Cumulata [mm]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]}_ - *${line.split(';')[1]}* - *${line.split(';')[2]}*`
                               counter++
                           }
                       })
                   } 

                   response += `\n\n[Download](${stazione.sensori.pluviometro.api_pluviometro})`;
                   ctx.replyWithMarkdown(response)
                });
            }
            if(stazione.sensori.idrometro.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.idrometro.api_idrometro).then( (path) => {
                    let response = `\n✅ Idrometro`;
                    response += '\n\n_Formato dati: Ora - Valore [m]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]} _- *${line.split(';')[1]}*`
                               counter++
                           }
                       })
                   } 
                   response += `\n\n[Download](${stazione.sensori.idrometro.api_idrometro})`;
                   ctx.replyWithMarkdown(response)
                });
            }
            if(stazione.sensori.temperatura_aria.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.temperatura_aria.api_temperatura_aria).then( (path) => {
                    let response = `\n✅ Temperatura Aria`;
                    response += '\n\n_Formato dati: Ora - Valore [C°]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]} _- *${line.split(';')[1]}*`
                               counter++
                           }
                       })
                   } 
                   response += `\n\n[Download](${stazione.sensori.temperatura_aria.api_temperatura_aria})`;
                   ctx.replyWithMarkdown(response)
                });
            }
            if(stazione.sensori.igrometro.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.igrometro.api_igrometro).then( (path) => {
                    let response = `\n✅ Igrometro`;
                    response += '\n\n_Formato dati: Ora - Valore [%]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]} _- *${line.split(';')[1]}*`
                               counter++
                           }
                       })
                   } 
                    response += `\n\n[Download](${stazione.sensori.igrometro.api_igrometro})`;
                   ctx.replyWithMarkdown(response)
                });
                
            }
            if(stazione.sensori.nivometro.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.nivometro.api_nivometro).then( (path) => {
                    let response = `\n✅ Nivometro`;
                    response += '\n\n_Formato dati: Ora - Valore [cm]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]} _- *${line.split(';')[1]}*`
                               counter++
                           }
                       })
                   } 
                   response += `\n\n[Download](${stazione.sensori.nivometro.api_nivometro})`;
                   ctx.replyWithMarkdown(response)
                });
            }
            if(stazione.sensori.barometro.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.barometro.api_barometro).then( (path) => {
                    let response = `\n✅ Barometro`;
                    response += '\n\n_Formato dati: Ora - Valore [hPa]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]} _- *${line.split(';')[1]}*`
                               counter++
                           }
                       })
                   } 
                   response += `\n\n[Download](${stazione.sensori.barometro.api_barometro})`;
                   ctx.replyWithMarkdown(response)
                });
            }
            if(stazione.sensori.radiometro.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.radiometro.api_radiometro).then( (path) => {
                    let response = `\n✅ Radiometro`;
                    response += '\n\n_Formato dati: Ora - Valore [W/mq]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]} _- *${line.split(';')[1]}*`
                               counter++
                           }
                       })
                   } 
                   response += `\n\n[Download](${stazione.sensori.radiometro.api_radiometro})`;
                   ctx.replyWithMarkdown(response)
                });
            }
            if(stazione.sensori.vento.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.vento.api_vento).then( (path) => {
                    let response = `\n✅ Vento`;
                    response += '\n\n_Formato dati: Ora - Valore [m/s]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]} _- *${line.split(';')[1]}*`
                               counter++
                           }
                       })
                   } 
                   response += `\n\n[Download](${stazione.sensori.vento.api_vento})`;
                   ctx.replyWithMarkdown(response)
                });
            }
            if(stazione.sensori.direzione_vento.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.vento.api_direzione_vento).then( (path) => {
                    let response = `\n✅ Vento`;
                    response += '\n\n_Formato dati: Ora - Valore [gradi]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]} _- *${line.split(';')[1]}*`
                               counter++
                           }
                       })
                   } 
                   response += `\n\n[Download](${stazione.sensori.vento.api_direzione_vento})`;
                   ctx.replyWithMarkdown(response)
                });
            }
            if(stazione.sensori.portata.id_sensore > 0 ) {
                API.GET_BaciniSensorData(stazione.sensori.portata.api_portata).then( (path) => {
                    let response = `\n✅ Vento`;
                    response += '\n\n_Formato dati: Ora - Valore [mc/s]_'
                   let content = fs.readFileSync(path, "utf8");
                   if(content)
                   {
                       let counter = 0;
                       content.split(/\r\n|\n/).reverse().forEach( line => {
                           if(counter <= 1) {
                               counter++
                           }
                           else if(counter > 1 && counter<7) {
                               response += `\n•_${line.split(';')[0]} _- *${line.split(';')[1]}*`
                               counter++
                           }
                       })
                   } 
                   response += `\n\n[Download](${stazione.sensori.portata.api_portata})`;
                   ctx.replyWithMarkdown(response)
                });
            }

           
        }
      
    });
} );




module.exports = {
    getStationAndSensorsNamesAsKeyboard,
    getSensorsData
}