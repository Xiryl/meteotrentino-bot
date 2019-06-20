const Telegraf = require('telegraf')
const config = require('./lib/config/config.json');
const LocalSession = require('telegraf-session-local');
const helpera = require('./lib/helper');
const keyboard = require('./lib/config/keyboards');

/**
 * Regex
 */
const RE_TODAY = new RegExp(/☀️ Meteo/i);

// init bot
const bot = new Telegraf(config["TOKEN"]);

// set sessions middleware
bot.use((new LocalSession({ database: 'session_db.json' })).middleware());

bot.use((ctx, next) => {
    const start = new Date();
    return next(ctx).then(() => {
      const ms = new Date() - start;
      console.log('Response time %sms', ms);
    })
  });


/**
 * Meteo command
 */
bot.hears(RE_TODAY, (ctx) => {
  // set sessions
  ctx.session.lastcommand = 'previsioni';
  ctx.session.lastquery = 'previsioni';

  helpera.BuildWeatherMessage('Arco').then( (msg) => {
    ctx.replyWithMarkdown(msg.forecast, msg.keyboard);
  }).catch( (e) => {
    console.log('error: ' + e );
  }); 
});


/**
 * Meteo command
 */
bot.hears(RE_TODAY, (ctx) => {
  // set sessions
  ctx.session.lastcommand = 'previsioni';
  ctx.session.lastquery = 'previsioni';

  helpera.BuildWeatherMessage('Arco').then( (msg) => {
    ctx.replyWithMarkdown(msg.forecast, msg.keyboard);
  }).catch( (e) => {
    console.log('error: ' + e );
  }); 
});

bot.on('callback_query', (ctx) => {
  console.log(ctx.callbackQuery.data)
  ctx.editMessageText('🎉 Awesome! 🎉')
})



bot.on('text', (ctx) => {
  ctx.replyWithMarkdown('ciao', keyboard.defKeyboard) 
})



bot.catch((err) => {
  console.log('Ooops', err)
})

bot.launch();