const Markup = require('telegraf/markup');
const dayConverter = require('./../dayConverter');

const defKeyboard = Markup.keyboard([
    ['☀️ Meteo', '⚡️ Radar', '⚠️ Allerte'],
    ['🗾 Sensori',, '⚙️ Opzioni', '❓ Aiuto']
  ])
  .oneTime()
  .resize()
  .extra();

let getInlineKeyboard = (dateObj) => {
  const day1 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate()));
  const day2 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day3 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day4 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day5 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day6 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));

  const inlineKeyboard = Markup.inlineKeyboard([
    [Markup.callbackButton('➕ Più Info', 'MORE_INFO')],
    [Markup.callbackButton('🔅'+day1, day1),
    Markup.callbackButton('🔅'+day2, day2),
    Markup.callbackButton('🔅'+day3, day3)],[
    Markup.callbackButton('🔅'+day4, day4),
    Markup.callbackButton('🔅'+day5, day5),
    Markup.callbackButton('🔅'+day6, day6)]
    ]
    )
    .resize()
    .extra();

    return inlineKeyboard;
}

module.exports = { defKeyboard, getInlineKeyboard }