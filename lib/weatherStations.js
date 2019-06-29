const Markup        = require('telegraf/markup');
var convert         = require('xml-js');
const API           = require('./API');
const keyboard      = require('./config/keyboards');

/**
 * ============================================================================
 *           		    MAKE STATION LIST AS KEYBOARD 
 * ============================================================================
 */
let getStationNamesAsKeyboard = () => {
    let arr = [];

    listCSV.split('\n').forEach( (row) => {
        name = row.split(',')[1] + `-${row.split(',')[0]}`;
        arr.push(['' + name]);
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
 *           		         GET STATION DATA 
 * ============================================================================
 */
let getStationData = (code, limit) => new Promise ( (resolve, reject) => {
    API.GET_WeatherStationData(code).then( (xml) => {
        let result1 = convert.xml2json(xml, {compact: true, spaces: 4});
        let prova = JSON.parse(result1);

        let counter = 0;
        let temp = "✅Ok, ecco le ultime Letture _(Staz. _\`"+code+"\`_)_:";
        temp += "\n\n🌡*Temperature*"
        prova.datiOggi.temperature.temperatura_aria.reverse().forEach( row => {
            counter++;

            if(counter <= limit) {
                temp += "\n•" + row.data._text.split('T')[1].split(',')[0] + " *"+row.temperatura._text + "C°*";
            }
          
        });

        counter = 0;
        temp += "\n\n🌧*Precipitazioni*"
        prova.datiOggi.precipitazioni.precipitazione.reverse().forEach( row => {
            counter++;

            if(counter <= limit) {
                temp += "\n•" + row.data._text.split('T')[1].split(',')[0] + " *"+row.pioggia._text + "mm*";
            }
          
        });

    
        if(limit > 20) {
            
            resolve({text:temp, keyboard:getStationNamesAsKeyboard()});
        }
        else{
            resolve({text:temp, keyboard:keyboard.sensorForFullData(code)});
        }
       
    }).catch( (err) => {
        resolve({text:`Ops, sembra che la stazione \`${code}\` non sia attiva 😔`, keyboard:getStationNamesAsKeyboard()});
    })
});


module.exports = { getStationNamesAsKeyboard, getStationData }

/**
 * ============================================================================
 *           		            :P 
 * ============================================================================
 */
const listCSV = " ,❌ Annulla,shortname,elevation,latitude,longitude,east,north,startdate,enddate\n" +
      "T0154,Ala (Convento),Ala Convento,165,45.757117,10.999871,655530,5069007,1921-01-01,2005-06-22\n" +
      "T0405,Ala (Maso Le Pozze),SM Ala Maso Le Pozze,170,45.786137,11.023828,657311.5,5072278,2012-05-17,\n" +
      "T0153,Ala (Ronchi),SM Ala Ronchi,692,45.73919,11.06545,660681.5,5067145,1927-08-01,\n" +
      "T0146,Aldeno (San Zeno),SM Aldeno San Zeno,182,45.968006,11.091231,662021,5092619,1923-11-01,\n" +
      "T0192,Arco,Arco,91,45.922561,10.890938,646623,5087182,1985-07-18,2005-02-10\n" +
      "T0322,Arco (Arboreto),Arco Arboreto,115,45.922268,10.883035,646011,5087135,2004-05-31,\n" +
      "T0401,Arco (Bruttagosto),SM Arco Bruttagosto,85,45.910374,10.887133,646360,5085821,2012-05-30,\n" +
      "T0204,Bezzecca,Bezzecca,698,45.896762,10.719079,633359,5084014,1921-01-01,2006-04-06\n" +
      "T0402,Bezzecca (Spessa),SM Bezzecca,710,45.895628,10.725025,633823,5083898,2012-06-06,\n" +
      "T0015,Bieno,SM Bieno,843,46.081097,11.557174,697716,5106237.2,1923-10-01,\n" +
      "T0222,Borgo Valsugana,Borgo Valsugana,385,46.052985,11.450479,689563,5102854,1921-01-01,2006-01-19\n" +
      "T0152,Brentonico,Brentonico,693,45.817224,10.953107,651730,5075595,1926-07-01,2010-02-03\n" +
      "T0155,Brentonico (Diga Di Pra' Da Stua),Pra' Da Stua Diga,1045,45.77223,10.904538,648076,5070505,1975-01-01,2003-12-31\n" +
      "T0443,Brentonico (Santa Caterina),SM Brentonico S. C.,727,45.824004,10.959756,652228,5076361,2009-12-21,\n" +
      "T0415,Bresimo (Malga Bordolona),SM Malga Bordolona,1815,46.433136,10.889328,645148,5143908,2012-05-16,\n" +
      "T0231,Campestrin,Campestrin,1385,46.464781,11.715096,708465,5149272,2002-09-01,2013-01-08\n" +
      "T0229,Campitello (Malga Do Col D'Aura),SM Malga Col D'Aura,2050,46.490938,11.65755,703949,5152028,2002-09-02,\n" +
      "T0323,Campodenno (frana),Campodenno frana,610,46.25978,11.028379,656324,5124913,2004-03-30,2016-08-02\n" +
      "T0030,Canal San Bovo,SM Canal San Bovo,750,46.14956,11.734845,711191,5114301,1927-10-01,\n" +
      "T0437,Canazei,SM Canazei,1465,46.478318,11.766852,712386,5150914,2012-03-28,\n" +
      "T0445,Canazei (Coi de Paussa),SEBA Coi de Paussa,2376,46.47197,11.849001,718717,5150433,2009-01-01,\n" +
      "T0421,Caoria,SM Caoria,803,46.192017,11.683911,707098.3,5118884,2007-05-15,\n" +
      "T0029,Caoria (Centrale),Caoria Centrale,908,46.204415,11.661787,705345,5120204,1921-01-01,2002-01-07\n" +
      "T0431,Capriana,SM Capriana,1055,46.263079,11.33633,680046,5125931,2012-04-04,\n" +
      "T0065,Careser (Diga),SM Careser Diga,2600,46.422651,10.698905,630544,5142411,1930-01-01,\n" +
      "T0418,Castelfondo (Malga Castrin),SM Malga Castrin,1815,46.510001,11.043574,656776.8,5152743.5,2012-05-30,\n" +
      "T0224,Castello Tesino,Castello Tesino,825,46.063186,11.630834,703477,5104433,1921-01-01,1941-12-31\n" +
      "T0469,Castello Tesino (Le Parti),SM Castello Tesino,801,46.056924,11.629929,703430,5103735,2007-05-11,\n" +
      "T0367,Cavalese,SM Cavalese,958,46.284782,11.451713,688863,5128611,1999-11-04,\n" +
      "T0107,Cavalese (Convento),Cavalese Convento,1000,46.291128,11.459228,689420,5129334,1921-01-01,2006-06-12\n" +
      "T0118,Cembra,SM Cembra,652,46.170372,11.217711,671193,5115368,1993-11-26,\n" +
      "T0009,Centa San Nicolo',SM Centa,805,45.970142,11.234176,673089,5093157,1929-12-01,\n" +
      "T0227,Cermis (Casere),SM Cermis,1900,46.250369,11.491486,692047,5124883,2002-08-28,\n" +
      "T0099,Cima Paganella,SM Paganella,2125,46.143328,11.037329,657346,5111990,1932-01-01,\n" +
      "T0365,Cima Presena,SM Cima Presena,3015,46.219964,10.583453,622123,5119706,1994-12-14,\n" +
      "T0377,Cima Rosetta,Cima Rosetta,2685,46.264631,11.833081,718320,5127352,2004-11-25,2008-10-28\n" +
      "T0160,Cimego (Centrale),Cimego Centrale,490,45.920353,10.627037,626142,5086558,1978-01-01,2004-01-03\n" +
      "T0083,Cles (Convento),Cles Convento,665,46.361979,11.031249,656254,5136272,1921-01-01,2006-03-06\n" +
      "T0397,Cles (Maso Maiano),SM Cles Maso Maiano,655,46.361167,11.039903,656922,5136199,2012-05-23,\n" +
      "T0068,Cogolo Pont (Centrale),Cogolo Pont,1190,46.364993,10.688939,629915,5135988,1929-10-01,\n" +
      "T0017,Costabrunella (Diga),Costabrunella Diga,2030,46.131108,11.584927,699681,5111863,1943-01-01,2003-12-31\n" +
      "T0156,Daone (Diga Di Malga Bissina),Malga Bissina Diga,1792,46.054815,10.513984,617115,5101252,1960-01-01,2005-10-31\n" +
      "T0157,Daone (Diga Di Malga Boazzo),Malga Boazzo Diga,1200,45.996038,10.523796,617999,5094736,1960-01-01,2005-10-31\n" +
      "T0158,Daone (Diga Di Ponte Morandin),Ponte Morandin Diga,720,45.948565,10.604272,624337,5089584,1960-01-01,2003-02-10\n" +
      "T0373,Daone (Malga Bissina),SM Malga Bissina,1785,46.052903,10.514122,617129.7,5101039.9,2002-10-03,\n" +
      "T0410,Daone (Pracul),SM Daone Pracul,897,45.971466,10.563104,621026.5,5092065,2007-05-12,\n" +
      "T0233,Dare',Dare',622,46.074889,10.716844,632759,5103801,1988-01-01,2003-12-31\n" +
      "T0086,Denno,Denno,426,46.273113,11.050857,658018,5126437,1921-01-01,2001-12-31\n" +
      "T0382,Dos Del Sabion (Monte Grual),SM Dos Del Sabion,1899,46.172262,10.812237,639888.7,5114783.5,2011-11-24,\n" +
      "T0379,Dro (Marocche),SM Dro Marocche,282,45.983947,10.94125,650358,5094096,2007-02-13,\n" +
      "T0210,Folgaria,SM Folgaria,1121,45.915349,11.164353,667845,5086920,1921-07-01,\n" +
      "T0399,Fondo,SM Fondo,910,46.437705,11.129627,663595,5144885,2012-05-23,\n" +
      "T0080,Fondo,Fondo,987,46.439645,11.138035,664235,5145118,1921-01-01,2004-08-02\n" +
      "T0237,Fontanazzo Di Mazzin,Fontanazzo,1400,46.470717,11.729238,709528,5149969,1974-01-01,1988-09-30\n" +
      "T0105,Forte Buso (Diga),Forte Buso Diga,1480,46.305785,11.704387,708247,5131578,1975-01-01,2003-12-31\n" +
      "T0203,Forte D'Ampola,SM Forte D'Ampola,740,45.863893,10.646293,627788,5080243,1924-01-01,\n" +
      "T0473,Ghiacciaio Del Careser,SEBA Ghiacc. Careser,3093,46.451278,10.718272,631963,5145624,2011-09-02,\n" +
      "T0444,Ghiacciaio di Fradusta,CT Fradusta,2720,46.255107,11.871709,721335,5126401,2010-09-01,\n" +
      "T0439,Ghiacciaio Presena,SEBA Gh. Presena,2852,46.223067,10.583565,622124.8,5120051,2011-11-17,\n" +
      "T0442,Ghiacciaio Presena (Passo Paradiso),SEBA Presena P.Parad,2587,46.238523,10.581405,621924,5121765,2011-10-28,\n" +
      "T0174,Giustino (Dos Del Sabion),Dos Del Sabion,2100,46.167101,10.805919,639414,5114199,1992-07-16,2007-01-17\n" +
      "T0426,Giustino (frana),SM Giustino frana,877,46.147487,10.775487,637113.5,5111966.7,2011-12-15,\n" +
      "T0423,Grigno,SM Grigno,238,46.006312,11.656835,705699,5098181,2007-05-11,\n" +
      "T0407,Grigno (Barricata),SM Grigno Barricata,1345,45.979906,11.590219,700637,5095077.2,2012-07-03,\n" +
      "T0113,Grumes,Grumes,845,46.220745,11.29667,677126,5121138,1993-10-28,2005-06-06\n" +
      "T0178,La Rocca (Centrale),La Rocca,943,46.022439,10.708152,632212,5097959,1975-01-01,2012-01-10\n" +
      "T0209,Lago Delle Piazze (Diga),Lago Piazze Diga,1028,46.15527,11.277625,675866,5113821,1975-01-01,1999-12-31\n" +
      "T0429,Lago Di Calaita,SM Lago Di Calaita,1605,46.200619,11.793483,715519.3,5120131.6,2007-05-23,\n" +
      "T0190,Lago Di Cavedine,Lago Di Cavedine,245,45.994317,10.951194,651100,5095267,1991-10-14,2012-09-26\n" +
      "T0430,Lago di Monticello al Ghiacciaio Presena,SEBA Lago Monticello,2606,46.236101,10.582801,622037,5121498,2010-10-22,\n" +
      "T0371,Lases (frana),SM Lases frana,705,46.139381,11.223419,671730,5111937,2000-07-14,\n" +
      "T0032,Lavarone (Chiesa),SM Lavarone,1155,45.940308,11.253721,674697,5089885,1921-01-01,\n" +
      "T0121,Lavis,Lavis,230,46.13844,11.11856,663634,5111611,1921-01-01,1994-08-31\n" +
      "T0245,Levico,Levico,512,46.010939,11.308556,678720,5097854,1921-01-01,1948-12-31\n" +
      "T0246,Levico (Lido),Levico Lido,440,46.010499,11.286127,676985,5097755,1949-01-01,1973-12-31\n" +
      "T0207,Levico (Selva),Levico Selva,502,46.011649,11.315729,679273,5097949,1974-01-01,1990-12-31\n" +
      "T0010,Levico (Terme),SM Levico Terme,502,46.010558,11.305143,678457,5097804,1981-01-01,\n" +
      "T0119,Lisignago,Lisignago,613,46.159328,11.192088,669249,5114086,1993-12-17,2009-11-02\n" +
      "T0232,Lodrone (frana),Lodrone frana,995,45.836335,10.524851,618420,5076994,2000-11-02,2001-12-31\n" +
      "T0286,Madonna Di Campiglio,Madonna Di Campiglio,1510,46.230624,10.827442,640913,5121295,1921-02-01,1974-12-31\n" +
      "T0074,Male',SM Male',720,46.351598,10.918411,647602,5134902,1921-01-01,\n" +
      "T0357,Male' (Bivacco Marinelli),SM Bivacco Marinelli,2100,46.356279,10.860666,643147,5135316,2013-11-28,\n" +
      "T0238,Malga Mare (Centrale),Malga Mare Centrale,1950,46.414236,10.680661,629162,5141446,1930-01-01,1984-12-31\n" +
      "T0375,Marmolada (Pian Dei Fiacconi),SEBA Marmolada,2676,46.444738,11.860795,719732,5147440,2001-06-04,\n" +
      "T0404,Marmolada (Sas Del Mul),SEBA Marmolada,2606,46.443614,11.880813,721274,5147371,2014-09-19,\n" +
      "T0265,Mazzin,Mazzin,1380,46.457404,11.700156,707346,5148413,1923-09-01,1966-12-31\n" +
      "T0071,Mezzana,SM Mezzana,905,46.313313,10.795904,638273,5130427,1921-01-01,\n" +
      "T0420,Mezzano,SM Mezzano,640,46.154673,11.812625,717177,5115079,2007-05-11,\n" +
      "T0090,Mezzolombardo (Convento),Mezzolombardo,225,46.214227,11.093392,661468,5119980,1921-01-01,2006-03-05\n" +
      "T0408,Mezzolombardo (Maso Delle Part),SM Mezzolombardo,204,46.187266,11.104432,662399,5117007,2012-05-31,\n" +
      "T0098,Moena,Moena,1175,46.375771,11.662227,704739,5139244,1921-01-01,1990-12-31\n" +
      "T0096,Moena (Diga Pezze'),SM Moena Diga Pezze',1205,46.383644,11.664651,704896,5140125,1990-09-11,\n" +
      "T0383,Molveno,SM Molveno,835,46.141618,10.957526,651187.5,5111645,2007-05-30,\n" +
      "T0182,Montagne (Larzana),SM Montagne,955,46.059072,10.7517,635493,5102102.5,1925-01-01,\n" +
      "T0144,Monte Bondone,Monte Bondone,1500,46.013494,11.05405,659010,5097598,1926-07-01,2005-04-05\n" +
      "T0327,Monte Bondone (Giardino Botanico),M. Bondone G Bot,1552,46.021903,11.039878,657889,5098504,2004-08-18,\n" +
      "T0368,Monte Bondone (Viote),SM M. Bondone Viote,1490,46.013651,11.054869,659073,5097617,1999-11-25,\n" +
      "T0169,Monte Groste' (Rifugio Graffer),SM Rifugio Graffer,2258,46.217722,10.889755,645752,5119974,1991-09-11,\n" +
      "T0226,Monte Ruioch (Rifugio Tonini),SM Rifugio Tonini,1900,46.167258,11.351504,681531,5115319.2,2002-09-16,\n" +
      "T0151,Mori (Loppio),SM Loppio,230,45.855333,10.931371,649939,5079788,1975-01-01,\n" +
      "T0186,Nembia (Centrale),Nembia Centrale,810,46.106228,10.938022,649777,5107676,1975-01-01,2012-01-09\n" +
      "T0262,Paganella (Dosso Larici),Paganella D. Larici,1850,46.152795,11.041926,657674,5113051,1931-08-01,1956-12-31\n" +
      "T0406,Paganella (Malga Terlago),SM Malga Terlago,1790,46.143008,11.021504,656124.7,5111923.2,2016-11-24,\n" +
      "T0267,Paneveggio (Bellamonte),Paneveggio,1415,46.311503,11.675589,706008,5132138,1921-01-01,1981-12-31\n" +
      "T0008,Paneveggio (campo neve),IASMA Paneveggio,1540,46.309517,11.747509,711553,5132107.7,2006-01-15,2012-12-31\n" +
      "T0355,Passo Brocon,SM Passo Brocon,1610,46.116677,11.663267,705786.2,5110459.7,1988-01-09,\n" +
      "T0168,Passo Campo Carlo Magno,P. Campo Carlo Magno,1681,46.242483,10.838355,641724,5122632,1975-01-01,2003-09-30\n" +
      "T0024,Passo Cereda,SM Passo Cereda,1322,46.195903,11.915734,724970,5119947,1975-01-01,\n" +
      "T0094,Passo Costalunga,SM Passo Costalunga,1750,46.404528,11.613615,700895,5142314.5,1967-01-01,\n" +
      "T0384,Passo Manghen,SM Passo Manghen,2035,46.174924,11.439944,688332,5116377,2011-08-18,\n" +
      "T0082,Passo Mendola,SM Passo Mendola,1315,46.419179,11.189336,668238.7,5142951.8,1921-01-01,\n" +
      "T0425,Passo Pian Delle Fugazze,SM P. Pian Fugazze,1170,45.758997,11.174829,669131,5069560,2012-05-16,\n" +
      "T0103,Passo Rolle,SM Passo Rolle,2012,46.297919,11.787124,714648,5130925,1921-01-01,\n" +
      "T0369,Passo Sommo,SM Passo Sommo,1360,45.918646,11.206083,671071,5087375,1999-08-05,\n" +
      "T0360,Passo Tonale,SM Passo Tonale,1875,46.262564,10.596825,623059,5124460,1987-11-27,\n" +
      "T0069,Passo Tonale,Passo Tonale,1795,46.263301,10.611068,624155,5124564,1923-06-01,2005-01-20\n" +
      "T0104,Passo Valles,SM Passo Valles,2032,46.33839,11.799791,715465,5135456,1985-01-01,\n" +
      "T0064,Peio,Peio,1565,46.363982,10.67566,628896,5135854,1921-01-01,2007-12-14\n" +
      "T0366,Peio,SM Peio,1585,46.364364,10.67783,629062,5135900,2002-05-17,\n" +
      "T0372,Peio (Crozzi Taviela),SM Crozzi Taviela,2960,46.384176,10.631957,625488,5138027.5,2002-09-22,\n" +
      "T0409,Pergine Valsugana,SM Pergine Valsugana,458,46.052554,11.240239,673301,5102326.5,2012-06-08,\n" +
      "T0001,Pergine Valsugana (Convento),Pergine,475,46.062276,11.236702,672997,5103399,1921-01-01,2006-01-23\n" +
      "T0092,Pian Fedaia (Diga),SM Pian Fedaia Diga,2063,46.459032,11.862873,719834,5149034,1938-01-01,\n" +
      "T0063,Pian Palu' (Diga),SM Pian Palu' Diga,1800,46.336633,10.613936,624210,5132716.5,1973-01-01,\n" +
      "T0380,Pian Palu' (Malga Giumella),SM Malga Giumella,1945,46.340912,10.612562,624094.6,5133189.8,2011-10-18,\n" +
      "T0140,Piazze Di Pine',Piazze Di Pine',1025,46.14997,11.273534,675567,5113223,1921-01-01,1985-12-31\n" +
      "T0428,Pieve Di Bono,SM Pieve Di Bono,525,45.940987,10.642872,627346,5088803,2007-06-20,\n" +
      "T0422,Pieve Tesino (Malga Sorgazza),SM Malga Sorgazza,1435,46.133545,11.59989,700828,5112171.5,2007-05-03,\n" +
      "T0018,Pieve Tesino (O.P. Enel),Pieve Tesino,785,46.070244,11.619803,702598,5105189,1942-01-01,2012-06-25\n" +
      "T0175,Pinzolo,SM Pinzolo,760,46.156507,10.757484,635701,5112938,1921-01-01,\n" +
      "T0435,Pinzolo (Malga Zeledria),SM Malga Zeledria,1775,46.244878,10.834362,641410,5122891,2011-10-05,\n" +
      "T0239,Pinzolo (Ponte Plaza),Pinzolo Ponte Plaza,1150,46.198195,10.817967,640265,5117675,1982-01-01,1984-12-31\n" +
      "T0142,Povo,Povo,430,46.066882,11.157728,666875,5103742,1989-05-12,2006-01-23\n" +
      "T0120,Pozzolago (Centrale),Pozzolago Centrale,420,46.165408,11.231851,672300,5114847,1929-08-01,1998-10-31\n" +
      "T0167,Pradalago (Rifugio Viviani),SM Pradalago,2084,46.249695,10.813895,639820,5123390,1991-09-06,\n" +
      "T0389,Predazzo,SM Predazzo,1000,46.297866,11.598248,700103,5130424.5,2012-06-13,\n" +
      "T0102,Predazzo (Centrale),Predazzo Centrale,1005,46.310012,11.595069,699814,5131766,1921-01-01,2005-11-28\n" +
      "T0324,Prezzo (frana),Prezzo frana,680,45.93418,10.631745,626499,5088029,2003-12-03,\n" +
      "T0241,Rabbi (Piazzola),Piazzola,1310,46.410657,10.819799,639864,5141285,1975-01-01,1991-11-30\n" +
      "T0076,Rabbi (San Bernardo),SM S. Bernardo,1132,46.401374,10.849515,642172,5140306,1986-01-01,\n" +
      "T0075,Rabbi (Somrabbi),Somrabbi,1352,46.410329,10.803614,638621,5141220,1991-11-26,2005-05-12\n" +
      "T0240,Rabbi (Tasse'),Tasse',1010,46.392538,10.857996,642847,5139340,1976-01-01,1984-12-31\n" +
      "T0436,Ragoli (Rifugio Alimonta),SEBA Rif. Alimonta,2577,46.172544,10.890629,645939,5114956,2007-06-30,\n" +
      "T0236,Romeno,SM Romeno,958,46.390687,11.118861,662908,5139638.5,1923-11-01,\n" +
      "T0424,Ronchi Valsugana (Malga Casapinello),SM Malga Casapinello,1710,46.095996,11.402298,685691.5,5107519,2012-06-20,\n" +
      "T0211,Ronzo,Ronzo,974,45.891054,10.952227,651461,5083796,1925-09-01,1996-12-31\n" +
      "T0147,Rovereto,SM Rovereto,203,45.896325,11.043987,658565,5084560,1921-07-01,\n" +
      "T0374,Rovereto (Malga Zugna),SM Rovereto M. Zugna,1620,45.807557,11.058163,659919,5074726,2003-06-12,\n" +
      "T0417,Rumo (Lanza),SM Rumo Lanza,1100,46.45391,11.008531,654247,5146442,2012-03-14,\n" +
      "T0184,San Lorenzo In Banale,S. Lorenzo In Banale,734,46.075645,10.899433,646876,5104206,1983-01-01,2001-11-30\n" +
      "T0414,San Lorenzo In Banale (Pergoletti),SM S. Lorenzo,685,46.066311,10.9113,647818.5,5103191,2007-06-20,\n" +
      "T0021,San Martino Di Castrozza,San Martino,1450,46.261279,11.801453,715896,5126893,1921-01-01,2007-12-17\n" +
      "T0450,San Martino di Castrozza,SM S. Martino,1470,46.261622,11.796306,715498,5126917,2007-05-17,\n" +
      "T0038,San Michele All'Adige,S. Michele,205,46.192588,11.13246,664546,5117656,1926-01-01,2005-03-29\n" +
      "T0242,San Silvestro (Centrale),S. Silvestro Centr.,577,46.134178,11.769207,713904,5112684,1975-01-01,1995-08-31\n" +
      "T0084,Santa Giustina (Diga),S. Giustina Diga,532,46.345656,11.061731,658646,5134519,1975-01-01,2003-12-31\n" +
      "T0189,Santa Massenza (Centrale),SM S. Massenza,252,46.065195,10.980275,653156,5103197.5,1975-01-01,\n" +
      "T0172,Sant'Antonio Di Mavignola,S. Antonio Mavignola,1100,46.188471,10.784498,637707,5116536,1986-01-01,1998-12-31\n" +
      "T0139,Sant'Orsola Terme,SM S. Orsola,925,46.107093,11.30223,677921,5108523,1929-08-01,\n" +
      "T0115,Segonzano (Gresta),SM Gresta,660,46.211224,11.289609,676612,5120064,1993-01-07,\n" +
      "T0116,Segonzano (Scancio),Scancio,720,46.191559,11.260009,674391,5117814,1993-12-01,2010-11-30\n" +
      "T0212,Spormaggiore,SM Spormaggiore,555,46.219949,11.046814,657859,5120522,1921-01-01,\n" +
      "T0183,Stenico,Stenico,632,46.050099,10.855215,643523,5101287,1921-01-01,2001-12-31\n" +
      "T0141,Sternigo,Sternigo,1040,46.139933,11.252223,673953,5112061,1986-01-01,2005-06-07\n" +
      "T0393,Storo,SM Storo,385,45.846767,10.562447,621317,5078209.5,2012-06-07,\n" +
      "T0163,Storo (Centrale),Storo Centrale,393,45.859267,10.575409,622296,5079618,1961-01-01,2000-10-30\n" +
      "T0370,Storo (Lodrone),Lodrone,392,45.829107,10.535649,619274,5076207,2000-09-22,2008-06-24\n" +
      "T0110,Stramentizzo (Diga),Stramentizzo Diga,815,46.264625,11.376144,683109,5126194,1973-01-01,2003-12-31\n" +
      "T0392,Telve,SM Telve,410,46.058046,11.477478,691634,5103481,2012-06-18,\n" +
      "T0014,Telve (Pontarso),SM Pontarso,925,46.115819,11.49451,692750,5109941,1923-10-01,\n" +
      "T0003,Tenna,Tenna,569,46.015735,11.263632,675227,5098287,1950-01-01,1990-12-31\n" +
      "T0200,Tenno,SM Tenno,415,45.91905,10.831278,642006,5086684,1975-01-01,\n" +
      "T0148,Terragnolo (Piazza),SM Terragnolo Piazza,800,45.879641,11.151135,666927,5082925,1923-11-01,\n" +
      "T0376,Tesero (Pala De Santa),Pala Santa,2200,46.346665,11.530301,694697,5135677,2000-07-20,2002-12-02\n" +
      "T0179,Tione,SM Tione,533,46.041087,10.730879,633926,5100069,1921-01-01,\n" +
      "T0026,Tonadico,Tonadico,744,46.179197,11.836033,718887,5117868,1926-01-01,2003-11-30\n" +
      "T0419,Tonadico (Castelpietra),SM Castelpietra,1045,46.198934,11.865668,721095,5120143,2007-05-11,\n" +
      "T0193,Torbole (Belvedere),SM Torbole Belvedere,90,45.870095,10.877355,645707,5081328,1965-01-01,\n" +
      "T0354,Tremalzo,SM Tremalzo,1560,45.841658,10.684142,630778,5077834,1988-01-08,\n" +
      "T0356,Trento (Aeroporto),SM TN Aeroporto,185,46.015993,11.12606,664577,5098022,2012-11-30,\n" +
      "T0129,Trento (Laste),SM Trento Laste,312,46.071801,11.135703,665157,5104242.5,1920-09-01,\n" +
      "T0454,Trento (Liceo Galilei),SM Trento Galilei,255,46.064375,11.13742,665312,5103421,2012-06-11,\n" +
      "T0137,Trento (Piazza Vittoria),Trento P. Vittoria,196,46.067661,11.123841,664252,5103758,1987-11-02,1992-04-30\n" +
      "T0135,Trento (Roncafort),SM Trento Roncafort,194,46.095645,11.10137,662432,5106821,1975-01-01,\n" +
      "T0136,Trento (Ufficio),Trento Ufficio,218,46.09002,11.11796,663731,5106230,1992-06-03,1999-12-31\n" +
      "T0088,Tres,SM Tres,838,46.32065,11.101437,661775,5131821,1993-11-18,\n" +
      "T0109,Val Cadino (Segheria Canton),SM Val Cadino,964,46.245819,11.414535,686131,5124194,1926-09-01,\n" +
      "T0413,Val D'Ambiez,SM Val D'Ambiez,1888,46.133428,10.881405,645330,5110593,2011-11-18,\n" +
      "T0177,Val di Breguzzo (Ponte Arno'),SM Val di Breguzzo,1148,46.032015,10.640606,626962,5098913,1975-01-01,\n" +
      "T0166,Val Di Genova (O.P. Enel),Val Genova Enel,900,46.169604,10.727251,633335,5114342,1975-01-01,2012-09-05\n" +
      "T0433,Val Genova (Malga Caret),SM Val Genova,1418,46.18142,10.634818,626172.7,5115503.8,2011-10-06,\n" +
      "T0027,Val Noana (Diga),SM Val Noana,1030,46.138717,11.839286,719299,5113379.5,1981-01-01,\n" +
      "T0432,Val Sella (Montagnola),SM Val Sella,956,46.006134,11.379319,684214,5097481.5,2007-05-24,\n" +
      "T0114,Valda,Valda,855,46.209157,11.267122,674884,5119785,1994-03-30,2009-10-06\n" +
      "T0149,Vallarsa (Diga Di Speccheri),Speccheri Diga,875,45.76847,11.134972,666003,5070540,1967-01-01,2013-01-22\n" +
      "T0150,Vallarsa (Foxi),Vallarsa Foxi,665,45.790139,11.110993,664075,5072898,1922-08-01,2007-11-29\n" +
      "T0363,Vallarsa (Malga Boffetal),Vallarsa,1550,45.750643,11.163452,668271,5068619,1998-02-14,2009-07-08\n" +
      "T0381,Vallarsa (Parrocchia),SM Parrocchia,737,45.780307,11.122849,665025.5,5071830,2012-04-19,\n" +
      "T0364,Vermiglio (Capanna Presena),SM Capanna Presena,2735,46.228822,10.578715,621738,5120683,2000-07-17,\n" +
      "T0416,Vermiglio (Masi di Palu'),SM Masi Palu',1575,46.284146,10.694689,630549.5,5127014.5,2011-10-19,\n" +
      "T0243,Vetriolo,Vetriolo,1490,46.04234,11.305974,678419,5101337,1935-01-01,1960-12-30\n" +
      "T0228,Vigo Di Fassa (Stalon De Vael),SM Stalon De Vael,2040,46.424419,11.636119,702551,5144582,2002-08-30,\n" +
      "T0326,Vigolo Vattaro (frana),Vigolo Vattaro frana,815,46.009208,11.181368,668879,5097384,2004-04-22,2008-06-10\n" +
      "T0411,Villa Rendena (Rifugio Gork),SM Rifugio Gork,1203,46.080894,10.660678,628402,5104376,2011-10-13,\n" +
      "T0101,Zambana (Idrovora),SM Zambana,205,46.156797,11.079051,660529,5113570,1935-01-01,\n" +
      "T0059,Ziano Di Fiemme (Malga Sadole),SM Malga Sadole,1608,46.260619,11.597609,700189.5,5126284.5,2012-05-24,\n" +
      "T0412,Zuclo (Malga Casinot),SM Malga Casinot,1695,45.971281,10.742036,634959,5092332,2011-11-26,";