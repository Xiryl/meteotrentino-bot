const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const API = require('./API');

const baseurl = "http://avvisi.protezionecivile.tn.it/PDFViewer.aspx?enc=";

/**
 * ============================================================================
 *                       ALERTS MESSAGE BUILDER
 *                          (It's pure magic.)
 * ============================================================================
 */
let getAlertList = () => new Promise((resolve, reject) => {
    API.GET_AlertsList().then( (body) => { 
        const dom = new JSDOM(body, {resources:'usable', runScripts: 'dangerously'});
        let avvisi = "Ultimi avvisi e allerte meteo:\n*In allegato l'ultimo avviso*:\n\n[Clicca qui](http://avvisi.protezionecivile.tn.it/elencoavvisi.aspx) _per vedere tutti gli avvisi._\n\n";
        let global = 0;
        dom.window.document.querySelector("ul").querySelectorAll("li").forEach(element => {
            let counter = 0;
            let link = "";
            element.querySelectorAll("span").forEach(spanEl => {
                if(counter === 0) {
                    counter ++;
                    link = element.querySelector("span").querySelector("a").getAttribute('onclick').split("/PDFViewer.aspx?enc=")[1].split('\'')[0];
                    avvisi += "\n⚠️ *" +spanEl.textContent.trim().toUpperCase() + "*" ;
                }else if(counter === 1) {
                    counter ++;
                    
                    avvisi += "\n       🌐 ["+spanEl.textContent.trim() +"]("+baseurl+link + ")";
                }
                else {
                    counter = 0;
                }

                global++;

                if (global === 12 ) {
                    resolve(avvisi);
                }
            });
        });
    });
});

module.exports = {
    getAlertList
}