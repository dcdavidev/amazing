import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Application-wide Pino logger instance.
 * Formats logs with `pino-pretty` during development for readable output,
 * and uses standard high-performance JSON output in production.
 */
export const logger = pino(
  isProduction
    ? {
        level: process.env.LOG_LEVEL ?? 'info',
      }
    : {
        level: process.env.LOG_LEVEL ?? 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
);
