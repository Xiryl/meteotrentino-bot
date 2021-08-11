const {
	createLogger,
	format,
	transports
} = require('winston');
const {Loggly} = require('winston-loggly-bulk');

const loggerTransports = [
	new transports.Console({
		level: 'debug',
		format: format.combine(
			format.colorize(),
			format.timestamp({
				format: 'YYYY-MM-DD HH:mm:ss'
			}),
			format.printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}`)
		)
	})
];

loggerTransports.push(
    new Loggly({
        token: "e77172fb-c381-49e8-8317-872d2134a450",
        subdomain: "mtbot",
        tags: ["Winston-NodeJS"],
        json: true,
    })
);

loggerTransports.push(
    new transports.File({ filename: 'log/meteotrentinobot.log', level: 'verbose' }),
);

const logger = createLogger({
	level: 'debug',
	format: format.combine(
		format.colorize(),
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		format.printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}`)
	),
	transports: loggerTransports
});

module.exports = logger;