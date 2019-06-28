const Telegraf      = require('telegraf')
const config        = require('./lib/config/config.json');
const LocalSession  = require('telegraf-session-local');
const helpera       = require('./lib/weather');
const executors     = require('./lib/executors');
const commands      = require('./lib/config/commands.js');
const strings       = require('./lib/config/strings');

// TODO: check to remove
const Extra         = require('telegraf/extra');
const Markup        = require('telegraf/markup');


/**
 * Regex
 */
const RE_TODAY = new RegExp(/☀️ Meteo/i);

// Init bot
const bot = new Telegraf(config["TOKEN"]);
executors.fillLocs();

// Middleware session
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
 * Init command
 */
bot.start((ctx) => {

  // set sessions
  ctx.session.lastcommand     = commands.POSITION;
  ctx.session.lastlocation    = '';
  ctx.session.defaultlocation = '';

  ctx.replyWithMarkdown(strings.WELCOME(ctx.chat.first_name));
});


/**
 * Weather command
 */
bot.hears(RE_TODAY, (ctx) => {

  // update sessions
  ctx.session.lastcommand = commands.FORECAST;

  helpera.BuildWeatherMessage(ctx.session.defaultlocation, true).then( (msg) => {
    ctx.replyWithMarkdown(msg.forecast, msg.keyboard);
  }).catch( (e) => {
    ctx.replyWithMarkdown
  }); 
});

/**
 * CALLBACK QUERYIES
 */

bot.action('LESS_INFO', (ctx) => {
  helpera.BuildWeatherMessage(ctx.session.defaultlocation).then( (msg) => {
    let kb = msg.keyboard;
    kb.parse_mode = 'Markdown';
    ctx.editMessageText(msg.forecast, kb);
  }).catch( (e) => {
    console.log('error: ' + e );
  }); 
});

bot.action('MORE_INFO', (ctx) => {
  helpera.BuildFullWeatherMessage(ctx.session.defaultlocation).then( (msg) => {
    let kb = msg.keyboard;
    kb.parse_mode = 'Markdown';
    ctx.editMessageText(msg.forecast, kb);
  }).catch( (e) => {
    console.log('error: ' + e );
  }); 
});


bot.on('text', (ctx) => {
  if(ctx.session.lastcommand === commands.POSITION) {

    ctx.session.lastcommand = commands.DEFAULT;

   executors.evalPosition(ctx.message.text).then(  ()  => {
      ctx.session.defaultlocation = ctx.message.text.toLowerCase();
      ctx.message.lastlocation = ctx.message.text.toLowerCase();
      ctx.replyWithMarkdown('aggiornato');
    }).catch( () => {
      ctx.replyWithMarkdown('err localita sbagliata riscrivila');
    });
  }
  else {
    ctx.replyWithMarkdown('comando non rilevato');
  }
})



bot.catch((err) => {
  console.log('Ooops', err)
})

bot.launch();