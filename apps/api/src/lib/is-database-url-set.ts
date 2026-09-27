import { env } from '../configs/env.ts';

/**
 * Checks whether the DATABASE_URL environment variable is defined and non-empty.
 *
 * @returns True if DATABASE_URL is defined and not empty, false otherwise.
 */
export function isDatabaseUrlSet(): boolean {
  return (
    typeof env.DATABASE_URL === 'string' && env.DATABASE_URL.trim().length > 0
  );
}
