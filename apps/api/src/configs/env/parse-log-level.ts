import { z } from 'zod';

import type { LogLevel, NodeEnv } from '../../types/env.ts';

const logLevelSchema = z.enum([
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
]);

/**
 * Validates and parses the LOG_LEVEL variable.
 *
 * @param raw - Raw environment string.
 * @param nodeEnv - Currently active NODE_ENV.
 * @returns Validated Pino log level.
 */
export function parseLogLevel(
  raw: string | undefined,
  nodeEnv: NodeEnv
): LogLevel {
  const defaultLevel: LogLevel = nodeEnv === 'production' ? 'info' : 'debug';
  if (raw === undefined || raw.trim() === '') {
    return defaultLevel;
  }
  const result = logLevelSchema.safeParse(raw.trim());
  if (!result.success) {
    console.error(
      `[Environment Validation Error] Invalid LOG_LEVEL: "${raw}".\n` +
        `  • Allowed values: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'\n` +
        `  • Possible fix: Set LOG_LEVEL=debug or LOG_LEVEL=info in apps/api/.env.\n` +
        `  • Fallback applied: '${defaultLevel}'`
    );
    return defaultLevel;
  }
  return result.data;
}
