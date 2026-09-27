import pino from 'pino';

import { env } from './configs/env.ts';

const isProduction = env.NODE_ENV === 'production';

/**
 * Application-wide Pino logger instance.
 * Formats logs with `pino-pretty` during development for readable output,
 * and uses standard high-performance JSON output in production.
 */
export const logger = pino(
  isProduction
    ? {
        level: env.LOG_LEVEL,
      }
    : {
        level: env.LOG_LEVEL,
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
