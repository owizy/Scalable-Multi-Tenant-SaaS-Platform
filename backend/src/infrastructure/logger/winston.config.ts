import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const WinstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, context, trace }) => {
            const ctx =
              typeof context === 'string' ? context : JSON.stringify(context);
            const trc =
              typeof trace === 'string' ? trace : JSON.stringify(trace);
            const ctxPart = context ? `[${ctx}] ` : '';
            const tracePart = trace ? '\n' + trc : '';

            return `${String(timestamp)} [${String(level)}] ${ctxPart}${String(message)}${tracePart}`;
          },
        ),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/application.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
