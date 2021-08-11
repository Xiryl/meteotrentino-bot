const Telegraf        = require('telegraf')
const config          = require('./lib/config/config.json');
const LocalSession    = require('telegraf-session-local');
const helpera         = require('./lib/weather');
const executors       = require('./lib/executors');
const commands        = require('./lib/config/commands.js');
const strings         = require('./lib/config/strings');
const alerts          = require('./lib/alertsConverter');
const radars          = require('./lib/radars');
const Extra           = require('telegraf/extra')
const keyboard        = require('./lib/config/keyboards');
const weatherStation  = require('./lib/weatherStations');
const baciniStation   = require('./lib/baciniStations');
const logger          = require('./lib/logger');

/**
 * ============================================================================
 *                              REGEX
 * ============================================================================
 */
const RE_TODAY      = new RegExp(/☀️ Meteo/i);
const RE_7DAYS      = new RegExp(/\d/i);
const RE_MORE_INFO  = new RegExp(/MORE_INFO \d{1,2}/i);
const RE_LESS_INFO  = new RegExp(/LESS_INFO \d{1,2}/i);
const RE_RADAR      = new RegExp(/⚡️ Radar/i);
const RE_ALERTS     = new RegExp(/⚠️ Allerte/i);
const RE_SENSORI    = new RegExp(/🗾 Sensori/i);
const RE_STAZIONI   = new RegExp(/🌡 Stazioni Metereologiche/i);
const RE_STAZIONECB = new RegExp(/^(FULL_DATA_STATION)/i);
const RE_DIGBACINI  = new RegExp(/🚏 Sensori Dighe e Bacini/i);
const RE_OPZIONI    = new RegExp(/⚙️ Opzioni/i);
const RE_HELP       = new RegExp(/❓ Aiuto/i);

/**
 * ============================================================================
 *                              INIT BOT
 * ============================================================================
 */
const bot = new Telegraf(config["TOKEN"]);
logger.info("Starting bot");

// read all locs
executors.fillLocs();

// middleware session
bot.use((new LocalSession({ database: './db/session_db.json' })).middleware());

/**
 * Apply context
 */
bot.use((ctx, next) => {
    const start = new Date();
    return next(ctx).then(() => {
      const ms = new Date() - start;
      console.log('Response time %sms', ms);
    })
  });

/**
 * ============================================================================
 *                              INIT COMMAND
 * ============================================================================
 */
bot.start((ctx) => {

  // create session
  ctx.session.lastcommand         = commands.POSITION;
  ctx.session.lastlocation        = '';
  ctx.session.defaultlocation     = '';
  ctx.session.interactions        = 0;
  ctx.session.lastWeatherStation  = '';
  ctx.session.counterWeather      = 0;
  ctx.session.counterRadar        = 0;
  ctx.session.counterAllert       = 0;
  ctx.session.counterSensor       = 0;
  ctx.replyWithMarkdown(strings.WELCOME(ctx.chat.first_name));
  logger.info(`Command /start, user: ${JSON.stringify(ctx.chat)}`);
});

/**
 * ============================================================================
 *                              WEATHER COMMAND
 * ============================================================================
 */
bot.hears(RE_TODAY, (ctx) => {
  // update sessions
  ctx.session.lastcommand = commands.FORECAST;
  ctx.session.userData=ctx.message.from;
  ctx.session.interactions++;
  ctx.session.counterWeather++;
  helpera.BuildWeatherMessage(ctx.session.defaultlocation).then( (msg) => {
    ctx.replyWithMarkdown(msg.forecast, msg.keyboard);
    logger.info(`Command /todayweather, user: ${JSON.stringify(ctx.chat)}`);
  }).catch( (e) => {
    ctx.replyWithMarkdown
  }); 
});

/**
 * ============================================================================
 *                              HELP COMMAND
 * ============================================================================
 */
bot.hears(RE_HELP, (ctx) => {
  ctx.replyWithMarkdown(strings.HELP);
  logger.info(`Command /help, user: ${JSON.stringify(ctx.chat)}`);
});


/**
 * ============================================================================
 *                              HELP COMMAND
 * ============================================================================
 */
bot.command('help', (ctx) => {
  ctx.replyWithMarkdown(strings.HELP);
  logger.info(`Command /help, user: ${JSON.stringify(ctx.chat)}`);
});

/**
 * ============================================================================
 *                           OPTIONS COMMAND
 * ============================================================================
 */
bot.hears(RE_OPZIONI, (ctx) => {
  ctx.replyWithMarkdown(strings.OPTIONS);
  logger.info(`Command /opzioni, user: ${JSON.stringify(ctx.chat)}`);
});

/**
 * ============================================================================
 *                      WEATHER [MORE INFO] CALLBACK
 * ============================================================================
 */
bot.action(RE_MORE_INFO, (ctx) => {
  ctx.session.counterWeather++;
  ctx.session.interactions++;
  helpera.BuildFullWeatherMessage(ctx.session.defaultlocation, ctx.update.callback_query.data.split(' ')[1]).then( (msg) => {
    let kb = msg.keyboard;
    kb.parse_mode = 'Markdown';
    ctx.editMessageText(msg.forecast, kb);
    logger.info(`Command /piuinfo, user: ${JSON.stringify(ctx.chat)}`);
  }).catch( (e) => {
    console.log('error: ' + e );
  }); 
});

/**
 * ============================================================================
 *                      WEATHER [LESS INFO] CALLBACK
 * ============================================================================
 */
bot.action(RE_LESS_INFO, (ctx) => {
  ctx.session.interactions++;
  
  helpera.BuildWeatherMessage(ctx.session.defaultlocation, ctx.update.callback_query.data.split(' ')[1]).then( (msg) => {
    let kb = msg.keyboard;
    kb.parse_mode = 'Markdown';
    ctx.editMessageText(msg.forecast, kb);
    logger.info(`Command /menoinfo, user: ${JSON.stringify(ctx.chat)}`);
  }).catch( (e) => {
    console.log('error: ' + e );
  }); 
});

/**
 * ============================================================================
 *                        WEATHER STATION CALLBACK
 * ============================================================================
 */
bot.action(RE_STAZIONECB, (ctx) => {
  ctx.session.interactions++;
  ctx.session.counterSensor++;
  weatherStation.getStationData(ctx.update.callback_query.data.split('-')[1], 100).then( (msg) => {
    ctx.replyWithMarkdown(msg.text, msg.keyboard);
    logger.info(`Command /datistazionicallback, user: ${JSON.stringify(ctx.chat)}`);
  });
});

/**
 * ============================================================================
 *                      WEATHER OTHER DAYS CALLBACK
 * ============================================================================
 */
bot.action(RE_7DAYS, (ctx) => {
  ctx.session.interactions++;
  ctx.session.counterWeather++;
  helpera.BuildWeatherMessage(ctx.session.defaultlocation, ctx.update.callback_query.data).then( (msg) => {
    ctx.replyWithMarkdown(msg.forecast, msg.keyboard);
    logger.info(`Command /datisettegiorni, user: ${JSON.stringify(ctx.chat)}`);
  }).catch( (e) => {
    ctx.replyWithMarkdown
  }); 
});

/**
 * ============================================================================
 *                              RADAR COMMAND
 * ============================================================================
 */
bot.hears(RE_RADAR, (ctx)  => {
  ctx.session.interactions++;
  ctx.session.counterRadar++;
  radars.getRadar().then( (path) => {
    logger.info(`Command /radar, user: ${JSON.stringify(ctx.chat)}`);
    ctx.replyWithAnimation({source: path} , Extra.markup((m) =>
    m.inlineKeyboard([
      [m.urlButton('🛰 Europa', 'https://it.sat24.com/it/it/visual'),
      m.urlButton('🛰 Pioggia', 'https://it.sat24.com/it/it/rainTMC')],[
      m.urlButton('🛰 KM',      'https://it.sat24.com/it/it/km'),
      m.urlButton('🛰 Neve',    'https://it.sat24.com/it/eu/snow')]
      ]
      )
      .resize()));
  });
  radars.getRadarFulmini().then( (path) => {
    logger.info(`Command /radar, user: ${JSON.stringify(ctx.chat)}`);
    ctx.replyWithAnimation({source: path} , Extra.markup((m) =>
    m.inlineKeyboard([
      [m.urlButton('🛰 Europa', 'https://it.sat24.com/it/it/visual'),
      m.urlButton('🛰 Pioggia', 'https://it.sat24.com/it/it/rainTMC')],[
      m.urlButton('🛰 KM',      'https://it.sat24.com/it/it/km'),
      m.urlButton('🛰 Neve',    'https://it.sat24.com/it/eu/snow')]
      ]
      )
      .resize()));
  });
});

/**
 * ============================================================================
 *                            ALLERT COMMAND
 * ============================================================================
 */
bot.hears(RE_ALERTS, (ctx) => {
  ctx.session.interactions++;
  ctx.session.counterAllert++;
  alerts.getAlertList().then( (msg) => {
     ctx.replyWithMarkdown(msg);
     logger.info(`Command /allerte, user: ${JSON.stringify(ctx.chat)}`);
  });
});

/**
 * ============================================================================
 *                            SENSOR COMMAND
 * ============================================================================
 */
bot.hears(RE_SENSORI, (ctx) => {
  ctx.session.interactions++;
  ctx.session.counterSensor++;
  logger.info(`Command /sensorilist, user: ${JSON.stringify(ctx.chat)}`);
  ctx.replyWithMarkdown('ℹ️ Scegli il tipo di dato che desideri visualizzare.\n\n_Al momento è disponibile una porzione limitata di sensori accessibili. Sono presenti i sensori relativi alle stazioni metereologiche e quelli relativi ai bacini_.\n\n_Cerchi un sensore specifico? Contattami! @Xiryl_', keyboard.sensorTypesKeyboard);
});

/**
 * ============================================================================
 *                       STATIONS AS LIST COMMAND
 * ============================================================================
 */
bot.hears(RE_STAZIONI, (ctx) => {
  ctx.session.interactions++;
  ctx.session.lastcommand = commands.STATION;
  logger.info(`Command /stazionilist, user: ${JSON.stringify(ctx.chat)}`);
  ctx.replyWithMarkdown('✅ Ok, Seleziona una stazione metereologica per visualizzare i dati!\n_Disponibili: temperatura e precipitazioni_.', weatherStation.getStationNamesAsKeyboard());
});

/**
 * ============================================================================
 *                       DIGHE & BACINI COMMAND
 * ============================================================================
 */
bot.hears(RE_DIGBACINI, (ctx) => {
  ctx.session.interactions++;
  ctx.session.lastcommand = commands.DIGBAC;
  ctx.session.counterSensor++;
  logger.info(`Command /dighebacini, user: ${JSON.stringify(ctx.chat)}`);
  ctx.replyWithMarkdown('✅ Ok, Seleziona un bacino per visualizzare i dati dei sensori disponibili!', keyboard.availableBaciniKeyboard);
});

/**
 * ============================================================================
 *                          GDPR COMMAND
 * ============================================================================
 */
bot.command('gdpr', (ctx) => {
  ctx.session.interactions++;
  logger.info(`Command /gdpr, user: ${JSON.stringify(ctx.chat)}`);
  ctx.replyWithMarkdown(`🔐*Dati*\n\nEcco i tuoi dati che sono mantenuti per far funzionare correttamente il bot:\n\n\`${JSON.stringify(ctx.session, null, 2)}\``);
});


/**
 * ============================================================================
 *                     cambialocalita COMMAND
 * ============================================================================
 */
bot.command('cambialocalita', (ctx) => {
  ctx.session.interactions++;
  ctx.session.lastcommand = commands.POSITION;
  logger.info(`Command /cambialoc, user: ${JSON.stringify(ctx.chat)}`);
  ctx.replyWithMarkdown(`✅ Ok, inviami la nuova località`);
});

/**
 * ============================================================================
 *                        DEFAULT HANDLER
 * ============================================================================
 */
bot.on('text', (ctx) => {
  ctx.session.interactions++;
  if(ctx.message.text.includes('Annulla')) {
    ctx.session.lastcommand = commands.DEFAULT;
    logger.info(`Command /annulla, user: ${JSON.stringify(ctx.chat)}`);
    ctx.replyWithMarkdown('✅ Ok, annullato.', keyboard.defKeyboard);
  }
  else if(ctx.session.lastcommand === commands.POSITION) {
    ctx.session.lastcommand = commands.DEFAULT;
    executors.evalPosition(ctx.message.text).then( ()  => {
      ctx.session.defaultlocation = ctx.message.text.toLowerCase();
      ctx.message.lastlocation = ctx.message.text.toLowerCase();
      logger.info(`Command /nuovalocalita, user: ${JSON.stringify(ctx.chat)}`);
      ctx.replyWithMarkdown(`✅ Ok, ${ctx.message.text} sarà la tua località di default.\n\n_Puoi cambiarla dal menu 'opzioni_'.`, keyboard.defKeyboard);
    }).catch( () => {
      ctx.session.lastcommand = commands.POSITION;
      logger.info(`Command /localitanontrovata, user: ${JSON.stringify(ctx.chat)}`);
      ctx.replyWithMarkdown('Località non riconosciuta. Inseriscine una nuova.');
    });
  }
  else if(ctx.session.lastcommand === commands.DIGBAC) {
    ctx.session.lastcommand = commands.DIGSENS
    ctx.session.bacinoName = ctx.message.text;
    logger.info(`Command /sceglisensore, user: ${JSON.stringify(ctx.chat)}`);
    ctx.replyWithMarkdown('✅ Ok, di quale stazione vorresti ricevere i dati dei sensori?', baciniStation.getStationAndSensorsNamesAsKeyboard(ctx.message.text));
  }
  else if(ctx.session.lastcommand === commands.DIGSENS) {
    baciniStation.getSensorsData(ctx.session.bacinoName, ctx.message.text, ctx).then( (path) => {
      ctx.replyWithMarkdown(path);
      logger.info(`Command /datisensore, user: ${JSON.stringify(ctx.chat)}`);
     // ctx.replyWithDocument({source:path});
    })
    .then( (path) => {
      ctx.replyWithMarkdown(path);
     // ctx.replyWithDocument({source:path});
    });
   
  }
  else if (ctx.session.lastcommand === commands.STATION) {
    ctx.session.lastWeatherStation = ctx.message.text.split('-')[0];
    weatherStation.getStationData(ctx.message.text.split('-')[1], 15).then( (msg) => {
      ctx.replyWithMarkdown(msg.text, msg.keyboard);
      logger.info(`Command /stazionidati, user: ${JSON.stringify(ctx.chat)}`);
    });
  }
  else {
    logger.info(`Command /comandonontrovato, user: ${JSON.stringify(ctx.chat)}`);
    ctx.replyWithMarkdown('Comando non rilevato. Prova /start', keyboard.defKeyboard);
  }
})

/**
 * ============================================================================
 *                              ERROR HANDLER
 * ============================================================================
 */
bot.catch((err) => {
  logger.info(`errore ${err}`);
})

/**
 * ============================================================================
 *                               START BOT
 * ============================================================================
 */
bot.launch();

/**
 * TODO: logger
 */