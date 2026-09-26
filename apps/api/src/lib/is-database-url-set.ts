/**
 * Checks whether the DATABASE_URL environment variable is defined and non-empty.
 *
 * @returns True if DATABASE_URL is defined and not empty, false otherwise.
 */
export function isDatabaseUrlSet(): boolean {
  const dbUrl = process.env.DATABASE_URL;
  return typeof dbUrl === 'string' && dbUrl.trim().length > 0;
}
