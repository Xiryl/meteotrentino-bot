const Markup        = require('telegraf/markup');
const dayConverter  = require('./../dayConverter');

/**
 * ============================================================================
 *                            DEFAULT KEYBOARD
 * ============================================================================
 */
const availableBaciniKeyboard = Markup.keyboard([
  ['brenta'],
  ['agno'],
  ['piave'],
  ['livenza'],
  ['monticano'],
  ['scolante laguna'],
  ['adige'],
  ['po/mincio'],
  ['brenta/cismon'],
  ['❌ Annulla']
])
.oneTime()
.resize()
.extra();

/**
 * ============================================================================
 *                          BACINI LIST KEYBOARD
 * ============================================================================
 */
const defKeyboard = Markup.keyboard([
  ['☀️ Meteo', '⚡️ Radar', '⚠️ Allerte'],
  ['🗾 Sensori',, '⚙️ Opzioni', '❓ Aiuto']
])
.oneTime()
.resize()
.extra();

  /**
 * ============================================================================
 *                   WEATHER MESSAGE INLINE KEYBOARD
 * ============================================================================
 */
let getInlineKeyboardMore = (dateObj, customDay) => {

  const day1 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate()));
  const day1_d = dateObj.getDate();
  const day2 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day2_d = dateObj.getDate();
  const day3 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day3_d = dateObj.getDate();
  const day4 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day4_d = dateObj.getDate();
  const day5 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day5_d = dateObj.getDate();
  const day6 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day6_d = dateObj.getDate();

  let inlineKeyboard;

  if(customDay) {
    const dayc = dayConverter.dayFromDate(customDay.setDate(customDay.getDate()));
    const dayc_d = customDay.getDate();

    inlineKeyboard = Markup.inlineKeyboard([
      [Markup.callbackButton('➕ Espandi', `MORE_INFO ${dayc_d}`)],
      [Markup.callbackButton('🔅'+day1, day1_d),
      Markup.callbackButton('🔅'+day2, day2_d),
      Markup.callbackButton('🔅'+day3, day3_d)],[
      Markup.callbackButton('🔅'+day4, day4_d),
      Markup.callbackButton('🔅'+day5, day5_d),
      Markup.callbackButton('🔅'+day6, day6_d)]
      ]
      )
      .resize()
      .extra();
  }
  else {
    inlineKeyboard = Markup.inlineKeyboard([
      [Markup.callbackButton('➕ Espandi', 'MORE_INFO ')],
      [Markup.callbackButton('🔅'+day1, day1_d),
      Markup.callbackButton('🔅'+day2, day2_d),
      Markup.callbackButton('🔅'+day3, day3_d)],[
      Markup.callbackButton('🔅'+day4, day4_d),
      Markup.callbackButton('🔅'+day5, day5_d),
      Markup.callbackButton('🔅'+day6, day6_d)]
      ]
      )
      .resize()
      .extra();
  }
    return inlineKeyboard;
}


/**
 * ============================================================================
 *                    WEATHER MESSAGE INLINE KEYBOARD (reduce)
 * ============================================================================
 */
let getInlineKeyboardLess = (dateObj, customDay) => {
  const day1 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate()));
  const day1_d = dateObj.getDate();
  const day2 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day2_d = dateObj.getDate();
  const day3 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day3_d = dateObj.getDate();
  const day4 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day4_d = dateObj.getDate();
  const day5 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day5_d = dateObj.getDate();
  const day6 = dayConverter.dayFromDate(dateObj.setDate(dateObj.getDate() +1));
  const day6_d = dateObj.getDate();

  if (customDay) {
    const dayc = dayConverter.dayFromDate(customDay.setDate(customDay.getDate()));
    const dayc_d = customDay.getDate();

    inlineKeyboard = Markup.inlineKeyboard([
      [Markup.callbackButton('➖ Riduci', `LESS_INFO ${dayc_d}`)],
      [Markup.callbackButton('🔅'+day1, day1_d),
      Markup.callbackButton('🔅'+day2, day2_d),
      Markup.callbackButton('🔅'+day3, day3_d)],[
      Markup.callbackButton('🔅'+day4, day4_d),
      Markup.callbackButton('🔅'+day5, day5_d),
      Markup.callbackButton('🔅'+day6, day6_d)]
      ]
      )
      .resize()
      .extra();
  }
  else {
    inlineKeyboard = Markup.inlineKeyboard([
      [Markup.callbackButton('➖ Riduci', 'MORE_INFO ')],
      [Markup.callbackButton('🔅'+day1, day1_d),
      Markup.callbackButton('🔅'+day2, day2_d),
      Markup.callbackButton('🔅'+day3, day3_d)],[
      Markup.callbackButton('🔅'+day4, day4_d),
      Markup.callbackButton('🔅'+day5, day5_d),
      Markup.callbackButton('🔅'+day6, day6_d)]
      ]
      )
      .resize()
      .extra();
  }
    return inlineKeyboard;
}

/**
 * ============================================================================
 *                        SENSOR TYPES KEYBOARD
 * ============================================================================
 */
const sensorTypesKeyboard = Markup.keyboard([
  ['🌡 Stazioni Metereologiche'],[ '🚏 Sensori Dighe e Bacini'], ['❌ Annulla']
])
.oneTime()
.resize()
.extra();

/**
 * ============================================================================
 *                        FOR SENSOR CALLBACK
 * ============================================================================
 */
let sensorForFullData = (code) => {
    return inlineKeyboard = Markup.inlineKeyboard([
      [Markup.callbackButton('➕ Tutti i dati', 'FULL_DATA_STATION-' + code)]
      ]
      )
      .resize()
      .extra();
}


module.exports = { defKeyboard, getInlineKeyboardMore, getInlineKeyboardLess, sensorTypesKeyboard, sensorForFullData, availableBaciniKeyboard }