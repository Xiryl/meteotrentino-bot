/**
 * ============================================================================
 *                            DEFAULT KEYBOARD
 * ============================================================================
 */
const BUTTONS = {
  METEO:    '☀️ Meteo',
  RADAR:    '⚡️ Radar',
  ALERTS:   '⚠️ Allerte',
  STATIONS: '🌡 Stazioni',
  WIND:     '🌬 Vento Garda',
  AUDIO:    '🎧 Bollettino audio',
  LOCATION: '📍 Località',
  HELP:     '❓ Aiuto',
  CANCEL:   '❌ Annulla',
  GPS:      '📡 Usa la mia posizione'
};

const defKeyboard = {
  reply_markup: {
    keyboard: [
      [BUTTONS.METEO, BUTTONS.RADAR, BUTTONS.ALERTS],
      [BUTTONS.STATIONS, BUTTONS.WIND, BUTTONS.AUDIO],
      [BUTTONS.LOCATION, BUTTONS.HELP]
    ],
    resize_keyboard: true
  }
};

/**
 * ============================================================================
 *                       ASK LOCATION KEYBOARD
 * ============================================================================
 */
let locationKeyboard = (suggestions = [], canCancel = true) => {
  const rows = [];
  for (let i = 0; i < suggestions.length; i += 2) {
    rows.push(suggestions.slice(i, i + 2));
  }
  rows.push([{ text: BUTTONS.GPS, request_location: true }]);
  if (canCancel) rows.push([BUTTONS.CANCEL]);
  return {
    reply_markup: {
      keyboard: rows,
      resize_keyboard: true,
      one_time_keyboard: true,
      input_field_placeholder: 'Es. Arco, Pinzolo, Trento…'
    }
  };
};

module.exports = { BUTTONS, defKeyboard, locationKeyboard };
