const Telegraf = require('telegraf')
const config = require('./lib/config/config.json.js');
const Markup = require('telegraf/markup');
const LocalSession = require('telegraf-session-local');

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
  /*
bot.on('text', (ctx) => {
  ctx.session.counter = ctx.session.counter || 0;
  ctx.session.counter++;
  ctx.replyWithMarkdown(`Counter updated, new value: \`${ctx.session.counter}\``);
  ctx.reply('Custom buttons keyboard', Markup
  .keyboard([
    ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
    ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
    ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
  ])
  .oneTime()
  .resize()
  .extra()
)
});
*/


bot.hears('☀️ Previsioni', (ctx) => {
  // set sessions
  ctx.session.lastcommand = 'previsioni';
  ctx.session.counter = ctx.session.counter || 0;
  ctx.session.counter++;

  ctx.reply('Previsioni:');
});

bot.command('☀️ Previsioni Meteo', (ctx) => {
  ctx.session.lastcommand = 'previsionimeteo';

  ctx.reply('previsdioni');
});

  bot.catch((err) => {
    console.log('Ooops', err)
  })

  bot.launch()