/**
 * Escapes text for Telegram HTML parse mode.
 */
let esc = (value) => String(value === undefined || value === null ? '' : value)
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;');

module.exports = { esc };
