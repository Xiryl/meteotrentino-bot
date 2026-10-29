const API     = require('./API');
const { esc } = require('./format');

const BASE_URL  = 'http://avvisi.protezionecivile.tn.it';
const MAX_ITEMS = 8;
const AVALANCHE_URL = 'https://avalanche.report/bulletin/latest';

let decode = (s) => s
	.replace(/&#(\d+);/g, (m, n) => String.fromCharCode(n))
	.replace(/&quot;/g, '"')
	.replace(/&apos;|&#39;/g, "'")
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>')
	.replace(/&nbsp;/g, ' ')
	.replace(/&amp;/g, '&');

let levelEmoji = (title) => {
	const t = title.toLowerCase();
	if (t.includes('rossa')) return '🔴';
	if (t.includes('arancione')) return '🟠';
	if (t.includes('gialla')) return '🟡';
	if (t.includes('allerta')) return '⚠️';
	return 'ℹ️';
};

/**
 * Parses the Protezione Civile list: each <li> holds a PDF link
 * (opened via window.open('/PDFViewer.aspx?enc=...')), a title and
 * an info span like "( 20 ottobre 2026 263 Kb )".
 */
let parseAlerts = (html) => {
	const items = [];
	const liRe = /<li>([\s\S]*?)<\/li>/g;
	let m;
	while ((m = liRe.exec(html)) !== null) {
		const li = m[1];
		const link  = li.match(/window\.open\('([^']*PDFViewer\.aspx\?enc=[^']+)'/);
		const title = li.match(/<a [^>]*lnkPDF[^>]*>([\s\S]*?)<\/a>/);
		const info  = li.match(/infoFile">\(\s*([\s\S]*?)\s*\)</);
		if (!link || !title) continue;
		items.push({
			title: decode(title[1].replace(/<[^>]+>/g, '').trim()) || 'Avviso / comunicato',
			date: info ? info[1].replace(/\s+\d+\s*[KkMm]b\s*$/, '').trim() : '',
			url: BASE_URL + link[1]
		});
	}
	return items;
};

/**
 * ============================================================================
 *                       ALERTS MESSAGE BUILDER
 * ============================================================================
 */
let getAlertList = async () => {
	const alerts = parseAlerts(await API.GET_AlertsList()).slice(0, MAX_ITEMS);
	if (!alerts.length) {
		throw new Error('no alerts parsed');
	}

	let text = '⚠️ <b>Avvisi e allerte della Protezione Civile</b>\n';
	alerts.forEach((a) => {
		text += `\n${levelEmoji(a.title)} <a href="${esc(a.url)}">${esc(a.title)}</a>`;
		if (a.date) text += `\n      <i>${esc(a.date)}</i>`;
	});
	text += '\n\n<i>Tocca un avviso per aprire il PDF ufficiale.</i>';

	return {
		text,
		extra: {
			parse_mode: 'HTML',
			link_preview_options: { is_disabled: true },
			reply_markup: {
				inline_keyboard: [[
					{ text: '🌐 Tutti gli avvisi', url: API.ALERTS_URL },
					{ text: '🏔 Bollettino valanghe', url: AVALANCHE_URL }
				]]
			}
		}
	};
};

module.exports = {
	getAlertList,
	parseAlerts
};
