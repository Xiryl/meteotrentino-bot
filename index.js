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

/**
 * REGEX
 */
const RE_TODAY      = new RegExp(/☀️ Meteo/i);
const RE_7DAYS      = new RegExp(/\d/i);
const RE_MORE_INFO  = new RegExp(/MORE_INFO \d{1,2}/i);
const RE_LESS_INFO  = new RegExp(/LESS_INFO \d{1,2}/i);
const RE_RADAR      = new RegExp(/⚡️ Radar/i);
const RE_ALERTS     = new RegExp(/⚠️ Allerte/i);
const RE_SENSORI    = new RegExp(/🗾 Sensori/i);
const RE_STAZIONI   = new RegExp(/🌡 Stazioni Meteo/i);
const RE_STAZIONECB = new RegExp(/^(FULL_DATA_STATION)/i);
const RE_DIGBACINI  = new RegExp(/^🚏 Dighe e Bacini/i);


// init bot
const bot = new Telegraf(config["TOKEN"]);

// read all locs
executors.fillLocs();

// middleware session
bot.use((new LocalSession({ database: 'session_db.json' })).middleware());

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
  }).catch( (e) => {
    ctx.replyWithMarkdown
  }); 
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
  ctx.replyWithMarkdown('ℹ️ Di quali sensori vuoi avere info? \n\n_Al momento è disponibile una porzione limitata di sensori accessibili_.\n_Cerchi un sensore specifico? Contattami! @Xiryl_', keyboard.sensorTypesKeyboard);
});

/**
 * ============================================================================
 *                       STATIONS AS LIST COMMAND
 * ============================================================================
 */
bot.hears(RE_STAZIONI, (ctx) => {
  ctx.session.interactions++;
  ctx.session.lastcommand = commands.STATION;
  ctx.replyWithMarkdown('✅Ok, Seleziona una stazione per ricevere gli ultimi dati!', weatherStation.getStationNamesAsKeyboard());
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
  ctx.replyWithMarkdown('✋Attualmente non attivo. Presto saranno disponibili!', keyboard.defKeyboard);
});

/**
 * ============================================================================
 *                          GDPR COMMAND
 * ============================================================================
 */
bot.command('gdpr', (ctx) => {
  ctx.session.interactions++;
  ctx.replyWithMarkdown(`Ecco i tuoi dati che immagazinniamo per far funzionare correttamente il bot:\n\n\`${JSON.stringify(ctx.session, null, 2)}\``);
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
    ctx.replyWithMarkdown('✅Ok, annullato.', keyboard.defKeyboard);
  }
  else if(ctx.session.lastcommand === commands.POSITION) {
    ctx.session.lastcommand = commands.DEFAULT;
    executors.evalPosition(ctx.message.text).then(  ()  => {
      ctx.session.defaultlocation = ctx.message.text.toLowerCase();
      ctx.message.lastlocation = ctx.message.text.toLowerCase();
      ctx.replyWithMarkdown('OK, aggiornato');
    }).catch( () => {
      ctx.session.lastcommand = commands.POSITION;
      ctx.replyWithMarkdown('Località non riconosciuta.');
    });
  }
  else if (ctx.session.lastcommand === commands.STATION) {
    ctx.session.lastWeatherStation = ctx.message.text.split('-')[0];
    weatherStation.getStationData(ctx.message.text.split('-')[1], 15).then( (msg) => {
      ctx.replyWithMarkdown(msg.text, msg.keyboard);
    });
  }
  else {
    ctx.replyWithMarkdown('comando non rilevato', keyboard.defKeyboard);
  }
})

/**
 * ============================================================================
 *                              ERROR HANDLER
 * ============================================================================
 */
bot.catch((err) => {
  console.log('Ooops', err)
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