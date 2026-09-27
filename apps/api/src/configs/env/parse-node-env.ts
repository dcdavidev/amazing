import { z } from 'zod';

import type { NodeEnv } from '../../types/env.ts';

const nodeEnvSchema = z.enum(['development', 'production', 'test']);

/**
 * Validates and parses the NODE_ENV variable.
 *
 * @param raw - Raw environment string.
 * @returns Validated environment mode.
 */
export function parseNodeEnv(raw: string | undefined): NodeEnv {
  if (raw === undefined || raw.trim() === '') {
    return 'development';
  }
  const result = nodeEnvSchema.safeParse(raw.trim());
  if (!result.success) {
    console.error(
      `[Environment Validation Error] Invalid NODE_ENV: "${raw}".\n` +
        `  • Allowed values: 'development' | 'production' | 'test'\n` +
        `  • Possible fix: Set NODE_ENV=development in apps/api/.env (or set to 'production' in your production environment).\n` +
        `  • Fallback applied: 'development'`
    );
    return 'development';
  }
  return result.data;
}
