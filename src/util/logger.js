const winston = require('winston');

const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf, colorize } = format;
const myFormat = printf(
  info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
);

const logger = createLogger({
  format: combine(label({ label: 'pouetdl' }), timestamp()),
  level: 'debug',
  transports: [
    new transports.Console({
      format: combine(colorize(), myFormat)
    })
  ]
});

export default logger;
