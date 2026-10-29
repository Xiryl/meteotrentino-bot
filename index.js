const fs              = require('fs');
const { Telegraf }    = require('telegraf');
const { message }     = require('telegraf/filters');
const LocalSession    = require('telegraf-session-local');
const weather         = require('./lib/weather');
const locations       = require('./lib/locations');
const commands        = require('./lib/config/commands.js');
const strings         = require('./lib/config/strings');
const alerts          = require('./lib/alertsConverter');
const radars          = require('./lib/radars');
const extras          = require('./lib/extras');
const { BUTTONS, defKeyboard, locationKeyboard } = require('./lib/config/keyboards');
const weatherStation  = require('./lib/weatherStations');
const logger          = require('./lib/logger');

let config = {};
try {
  config = require('./lib/config/config.json');
} catch (e) {
  // token can also come from the environment
}

const TOKEN = process.env.BOT_TOKEN || config["TOKEN"];
if (!TOKEN) {
  logger.error('Missing bot token: set BOT_TOKEN or lib/config/config.json {"TOKEN": "..."}');
  process.exit(1);
}

const HTML = { parse_mode: 'HTML', link_preview_options: { is_disabled: true } };

/**
 * ============================================================================
 *                              REGEX
 * ============================================================================
 * Old labels are still matched: users may have the previous keyboard cached.
 */
const RE_TODAY      = /^☀️ Meteo/i;
const RE_RADAR      = /^⚡️ Radar/i;
const RE_ALERTS     = /^⚠️ Allerte/i;
const RE_STAZIONI   = /^(🌡 Stazioni|🗾 Sensori)/i;
const RE_DIGBACINI  = /^🚏 Sensori Dighe e Bacini/i;
const RE_LOCATION   = /^(📍 Località|⚙️ Opzioni)/i;
const RE_HELP       = /^❓ Aiuto/i;
const RE_WIND       = /^🌬 Vento Garda/i;
const RE_AUDIO      = /^🎧 Bollettino audio/i;

const RE_WEATHER_CB = /^W\|(\d{4}-\d{2}-\d{2})\|([01])(\|r)?$/;
const RE_STATION_CB = /^S\|([0-9a-f-]{36})\|([01])(\|r)?$/;
const RE_LEGACY_STATION_CB = /^FULL_DATA_STATION-/;
const RE_LEGACY_WEATHER_CB = /^(MORE_INFO|LESS_INFO|\d{1,2}$)/;

/**
 * ============================================================================
 *                              INIT BOT
 * ============================================================================
 */
// TELEGRAM_API_ROOT: optional, e.g. a self-hosted Bot API server
const bot = new Telegraf(TOKEN, process.env.TELEGRAM_API_ROOT ? { telegram: { apiRoot: process.env.TELEGRAM_API_ROOT } } : {});
logger.info("Starting bot");

// middleware session
fs.mkdirSync('./db', { recursive: true });
bot.use((new LocalSession({ database: './db/session_db.json' })).middleware());

bot.use((ctx, next) => {
  const start = new Date();
  return next().then(() => {
    const ms = new Date() - start;
    console.log('Response time %sms', ms);
  });
});

/**
 * ============================================================================
 *                              HELPERS
 * ============================================================================
 */
// a main menu action cancels any pending question (location / station)
let resetState = (ctx) => {
  ctx.session.lastcommand = commands.DEFAULT;
};

let track = (ctx, counter) => {
  ctx.session.interactions = (ctx.session.interactions || 0) + 1;
  if (counter) ctx.session[counter] = (ctx.session[counter] || 0) + 1;
};

let logCommand = (ctx, name) => logger.info(`Command /${name}, user: ${JSON.stringify(ctx.chat)}`);

/**
 * Returns the user's place, migrating sessions created by the previous
 * version of the bot (which only stored the location name).
 */
let getPlace = (ctx) => {
  const s = ctx.session;
  if (s.place && locations.getVenue(s.place.venueId)) return s.place;
  if (s.defaultlocation) {
    const { match } = locations.resolve(s.defaultlocation);
    if (match) {
      s.place = { label: match.label, venueId: match.venue.id, distanceKm: match.distanceKm };
      return s.place;
    }
  }
  return null;
};

let savePlace = (ctx, match) => {
  ctx.session.place = { label: match.label, venueId: match.venue.id, distanceKm: match.distanceKm };
  ctx.session.defaultlocation = match.label;
  ctx.session.lastcommand = commands.DEFAULT;
};

let askLocation = (ctx) => {
  ctx.session.lastcommand = commands.POSITION;
  return ctx.reply(strings.ASK_LOCATION, { ...HTML, ...locationKeyboard([], !!getPlace(ctx)) });
};

let ignoreNotModified = (e) => {
  if (!/message is not modified/i.test(e.description || e.message)) throw e;
};

let sendWeather = async (ctx) => {
  const place = getPlace(ctx);
  if (!place) {
    await ctx.reply(strings.NO_LOCATION, HTML);
    return askLocation(ctx);
  }
  ctx.sendChatAction('typing').catch(() => {});
  try {
    const msg = await weather.BuildWeatherMessage(place, null, false);
    await ctx.reply(msg.text, msg.extra);
  } catch (e) {
    logger.error(`weather error: ${e.stack || e}`);
    await ctx.reply(strings.ERROR, defKeyboard);
  }
};

let onLocationFound = async (ctx, match) => {
  savePlace(ctx, match);
  logCommand(ctx, 'nuovalocalita');
  await ctx.reply(strings.LOCATION_SAVED(match.label), { ...HTML, ...defKeyboard });
  return sendWeather(ctx);
};

/**
 * ============================================================================
 *                              INIT COMMAND
 * ============================================================================
 */
bot.start((ctx) => {
  ctx.session.lastcommand         = commands.POSITION;
  ctx.session.interactions        = ctx.session.interactions || 0;
  ctx.session.counterWeather      = ctx.session.counterWeather || 0;
  ctx.session.counterRadar        = ctx.session.counterRadar || 0;
  ctx.session.counterAllert       = ctx.session.counterAllert || 0;
  ctx.session.counterSensor       = ctx.session.counterSensor || 0;
  logCommand(ctx, 'start');
  return ctx.reply(strings.WELCOME(ctx.from.first_name), { ...HTML, ...locationKeyboard([], false) });
});

/**
 * ============================================================================
 *                              WEATHER COMMAND
 * ============================================================================
 */
let onWeather = (ctx) => {
  resetState(ctx);
  track(ctx, 'counterWeather');
  logCommand(ctx, 'todayweather');
  return sendWeather(ctx);
};
bot.command('meteo', onWeather);
bot.hears(RE_TODAY, onWeather);

/**
 * ============================================================================
 *                 WEATHER CALLBACK (day switch / details / refresh)
 * ============================================================================
 */
let editWeather = async (ctx, date, expanded, refresh) => {
  track(ctx, 'counterWeather');
  const place = getPlace(ctx);
  if (!place) {
    await ctx.answerCbQuery('Imposta prima una località');
    return askLocation(ctx);
  }
  try {
    const msg = await weather.BuildWeatherMessage(place, date, expanded);
    await ctx.editMessageText(msg.text, msg.extra).catch(ignoreNotModified);
    await ctx.answerCbQuery(refresh ? 'Aggiornato ✅' : undefined);
  } catch (e) {
    logger.error(`weather callback error: ${e.stack || e}`);
    await ctx.answerCbQuery('Servizio non disponibile, riprova più tardi', { show_alert: true }).catch(() => {});
  }
};

bot.action(RE_WEATHER_CB, (ctx) => {
  const [, date, expanded, refresh] = ctx.match;
  logCommand(ctx, expanded === '1' ? 'piuinfo' : 'menoinfo');
  return editWeather(ctx, date, expanded === '1', !!refresh);
});

// buttons of messages sent by the previous version of the bot
bot.action(RE_LEGACY_WEATHER_CB, (ctx) => editWeather(ctx, null, false, false));

/**
 * ============================================================================
 *                              RADAR COMMAND
 * ============================================================================
 */
let onRadar = async (ctx) => {
  resetState(ctx);
  track(ctx, 'counterRadar');
  logCommand(ctx, 'radar');
  ctx.sendChatAction('upload_video').catch(() => {});
  const results = await Promise.allSettled([radars.getRadar(), radars.getRadarFulmini()]);
  let sent = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') {
      await ctx.replyWithAnimation(r.value.media, r.value.extra);
      sent++;
    } else {
      logger.error(`radar error: ${r.reason}`);
    }
  }
  if (!sent) await ctx.reply(strings.ERROR);
};
bot.command('radar', onRadar);
bot.hears(RE_RADAR, onRadar);

/**
 * ============================================================================
 *                            ALERTS COMMAND
 * ============================================================================
 */
let onAlerts = async (ctx) => {
  resetState(ctx);
  track(ctx, 'counterAllert');
  logCommand(ctx, 'allerte');
  try {
    const msg = await alerts.getAlertList();
    await ctx.reply(msg.text, msg.extra);
  } catch (e) {
    logger.error(`alerts error: ${e.stack || e}`);
    await ctx.reply(strings.ERROR);
  }
};
bot.command('allerte', onAlerts);
bot.hears(RE_ALERTS, onAlerts);

/**
 * ============================================================================
 *                       STATIONS AS LIST COMMAND
 * ============================================================================
 */
let onStations = async (ctx) => {
  track(ctx, 'counterSensor');
  ctx.session.lastcommand = commands.STATION;
  logCommand(ctx, 'stazionilist');
  return ctx.reply('🌡 Scegli una stazione meteo per vedere le ultime letture, oppure usa quella più vicina a te 📡\n<i>temperatura, pioggia, vento, umidità e pressione</i>',
    { ...HTML, ...weatherStation.getStationNamesAsKeyboard() });
};

let sendStation = async (ctx, station, note) => {
  ctx.session.lastWeatherStation = station.id;
  ctx.session.lastcommand = commands.DEFAULT;
  logCommand(ctx, 'stazionidati');
  ctx.sendChatAction('typing').catch(() => {});
  try {
    const msg = await weatherStation.getStationData(station.id, false);
    await ctx.reply(note ? `${note}\n\n${msg.text}` : msg.text, msg.extra);
    return ctx.reply('Vuoi vedere un\'altra stazione? Usa 🌡 Stazioni.', defKeyboard);
  } catch (e) {
    logger.error(`station error: ${e.stack || e}`);
    return ctx.reply(`😔 La stazione ${station.name} non ha dati recenti.`, defKeyboard);
  }
};
bot.command('stazioni', onStations);
bot.hears(RE_STAZIONI, onStations);

/**
 * ============================================================================
 *                        WEATHER STATION CALLBACK
 * ============================================================================
 */
let editStation = async (ctx, id, full, refresh) => {
  track(ctx, 'counterSensor');
  try {
    const msg = await weatherStation.getStationData(id, full);
    await ctx.editMessageText(msg.text, msg.extra).catch(ignoreNotModified);
    await ctx.answerCbQuery(refresh ? 'Aggiornato ✅' : undefined);
  } catch (e) {
    logger.error(`station callback error: ${e.stack || e}`);
    await ctx.answerCbQuery('Stazione non disponibile al momento', { show_alert: true }).catch(() => {});
  }
};

bot.action(RE_STATION_CB, (ctx) => {
  const [, id, full, refresh] = ctx.match;
  logCommand(ctx, 'datistazionicallback');
  return editStation(ctx, id, full === '1', !!refresh);
});

// buttons of messages sent by the previous version of the bot (old station codes)
bot.action(RE_LEGACY_STATION_CB, async (ctx) => {
  await ctx.answerCbQuery('Messaggio scaduto, scegli di nuovo la stazione').catch(() => {});
  return onStations(ctx);
});

/**
 * ============================================================================
 *                     GARDA WIND / AUDIO BULLETIN
 * ============================================================================
 */
let onWind = async (ctx) => {
  resetState(ctx);
  track(ctx, 'counterWind');
  logCommand(ctx, 'ventogarda');
  ctx.sendChatAction('upload_photo').catch(() => {});
  try {
    for (const photo of await extras.getGardaWind()) {
      await ctx.replyWithPhoto(photo.media, photo.extra);
    }
  } catch (e) {
    logger.error(`wind error: ${e.stack || e}`);
    await ctx.reply(strings.ERROR);
  }
};
bot.command('vento', onWind);
bot.hears(RE_WIND, onWind);

let onAudio = async (ctx) => {
  resetState(ctx);
  track(ctx, 'counterAudio');
  logCommand(ctx, 'audio');
  ctx.sendChatAction('upload_voice').catch(() => {});
  try {
    const audio = await extras.getAudioBulletin();
    await ctx.replyWithAudio(audio.media, audio.extra);
  } catch (e) {
    logger.error(`audio error: ${e.stack || e}`);
    await ctx.reply(strings.ERROR);
  }
};
bot.command('audio', onAudio);
bot.hears(RE_AUDIO, onAudio);

/**
 * ============================================================================
 *                       DIGHE & BACINI (discontinued)
 * ============================================================================
 */
bot.hears(RE_DIGBACINI, (ctx) => {
  resetState(ctx);
  logCommand(ctx, 'dighebacini');
  return ctx.reply('🚏 I dati di dighe e bacini (floods.it) non sono più pubblicati, la funzione è stata rimossa.\nPuoi consultare le stazioni meteo con 🌡 Stazioni.', defKeyboard);
});

/**
 * ============================================================================
 *                         LOCATION / HELP / GDPR
 * ============================================================================
 */
let onChangeLocation = (ctx) => {
  track(ctx);
  logCommand(ctx, 'cambialoc');
  return askLocation(ctx);
};
bot.command('cambialocalita', onChangeLocation);
bot.hears(RE_LOCATION, onChangeLocation);

let onHelp = (ctx) => {
  resetState(ctx);
  logCommand(ctx, 'help');
  return ctx.reply(strings.HELP, { ...HTML, ...defKeyboard });
};
bot.command('help', onHelp);
bot.hears(RE_HELP, onHelp);

bot.command('gdpr', (ctx) => {
  track(ctx);
  logCommand(ctx, 'gdpr');
  const data = JSON.stringify(ctx.session, null, 2).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return ctx.reply(`🔐 <b>Dati</b>\n\nEcco i dati conservati per far funzionare il bot:\n\n<pre>${data}</pre>`, HTML);
});

/**
 * ============================================================================
 *                        SHARED GPS LOCATION
 * ============================================================================
 */
bot.on(message('location'), (ctx) => {
  track(ctx);
  const { latitude, longitude } = ctx.message.location;

  // "nearest station" button of the station keyboard
  if (ctx.session.lastcommand === commands.STATION) {
    const near = weatherStation.nearestStation(latitude, longitude);
    if (near.distanceKm > 40) {
      ctx.session.lastcommand = commands.DEFAULT;
      return ctx.reply('😕 Nessuna stazione meteo trentina vicino a te.', defKeyboard);
    }
    return sendStation(ctx, near.station, `📡 Stazione più vicina: ${Math.round(near.distanceKm)} km`);
  }

  const match = locations.resolveCoordinates(latitude, longitude);
  if (match.distanceKm > 30) {
    logCommand(ctx, 'posizionelontana');
    ctx.session.lastcommand = commands.POSITION;
    return ctx.reply(strings.LOCATION_TOO_FAR, { ...HTML, ...locationKeyboard([], !!getPlace(ctx)) });
  }
  return onLocationFound(ctx, match);
});

/**
 * ============================================================================
 *                        DEFAULT HANDLER
 * ============================================================================
 */
bot.on(message('text'), async (ctx) => {
  track(ctx);
  const text = ctx.message.text;

  if (text.includes('Annulla')) {
    ctx.session.lastcommand = commands.DEFAULT;
    logCommand(ctx, 'annulla');
    return ctx.reply('✅ Ok, annullato.', defKeyboard);
  }

  if (ctx.session.lastcommand === commands.POSITION) {
    const { match, suggestions } = locations.resolve(text);
    if (match) {
      return onLocationFound(ctx, match);
    }
    logCommand(ctx, 'localitanontrovata');
    if (suggestions.length) {
      return ctx.reply(strings.LOCATION_SUGGEST, { ...HTML, ...locationKeyboard(suggestions, !!getPlace(ctx)) });
    }
    return ctx.reply(strings.LOCATION_NOT_FOUND, { ...HTML, ...locationKeyboard([], !!getPlace(ctx)) });
  }

  if (ctx.session.lastcommand === commands.STATION) {
    const station = weatherStation.findStation(text);
    if (!station) {
      return ctx.reply('😕 Stazione non trovata, scegline una dalla tastiera.');
    }
    return sendStation(ctx, station);
  }

  // no pending question: maybe the user just typed a place name
  const { match } = locations.resolve(text);
  if (match) {
    logCommand(ctx, 'meteolocalita');
    ctx.sendChatAction('typing').catch(() => {});
    try {
      const msg = await weather.BuildWeatherMessage(
        { label: match.label, venueId: match.venue.id, distanceKm: match.distanceKm }, null, false);
      await ctx.reply(msg.text, msg.extra);
      if (!getPlace(ctx)) savePlace(ctx, match);
      return;
    } catch (e) {
      logger.error(`weather error: ${e.stack || e}`);
      return ctx.reply(strings.ERROR, defKeyboard);
    }
  }

  logCommand(ctx, 'comandonontrovato');
  return ctx.reply('🤷 Non ho capito. Usa i pulsanti qui sotto oppure /help.', defKeyboard);
});

/**
 * ============================================================================
 *                              ERROR HANDLER
 * ============================================================================
 */
bot.catch((err, ctx) => {
  logger.error(`errore update ${ctx && ctx.updateType}: ${err && (err.stack || err)}`);
});

/**
 * ============================================================================
 *                               START BOT
 * ============================================================================
 */
bot.telegram.setMyCommands([
    { command: 'meteo',          description: 'Previsioni per la tua località' },
    { command: 'radar',          description: 'Radar precipitazioni e fulmini' },
    { command: 'allerte',        description: 'Avvisi della Protezione Civile' },
    { command: 'stazioni',       description: 'Dati delle stazioni meteo' },
    { command: 'vento',          description: 'Previsione del vento sul Garda' },
    { command: 'audio',          description: 'Bollettino audio Meteotrentino' },
    { command: 'cambialocalita', description: 'Cambia località' },
    { command: 'help',           description: 'Aiuto e informazioni' }
]).catch((e) => logger.error(`setMyCommands: ${e}`));

bot.launch().catch((e) => {
  logger.error(`launch failed: ${e.stack || e}`);
  process.exit(1);
});
logger.info('Bot started');

// graceful stop (docker stop / Ctrl+C)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
