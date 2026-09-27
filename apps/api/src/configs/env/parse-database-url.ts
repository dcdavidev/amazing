import { z } from 'zod';

const databaseUrlSchema = z
  .string()
  .min(1)
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return (
        (parsed.protocol === 'postgresql:' ||
          parsed.protocol === 'postgres:') &&
        Boolean(parsed.hostname) &&
        Boolean(parsed.pathname && parsed.pathname !== '/')
      );
    } catch {
      return false;
    }
  });

/**
 * Validates and parses the DATABASE_URL variable.
 *
 * @param raw - Raw environment string.
 * @returns Validated database URL string.
 */
export function parseDatabaseUrl(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === '') {
    console.error(
      `[Environment Validation Error] DATABASE_URL is not set or is empty.\n` +
        `  • Required format: postgresql://<user>:<password>@<host>:<port>/<database>?schema=<schema>\n` +
        `  • Possible fixes:\n` +
        `      1. Add DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amazing_db?schema=public" to apps/api/.env\n` +
        `      2. Run "pnpm db:setup" from repository root to launch Docker PostgreSQL and apply migrations.\n` +
        `  • Notice: Database queries will fail until a valid connection string is provided.`
    );
    return '';
  }
  const result = databaseUrlSchema.safeParse(raw.trim());
  if (!result.success) {
    console.error(
      `[Environment Validation Error] Invalid DATABASE_URL: "${raw}".\n` +
        `  • Allowed format: PostgreSQL URL starting with postgresql:// or postgres:// with host and database name\n` +
        `  • Possible fixes:\n` +
        `      1. Check apps/api/.env and verify format (e.g. postgresql://postgres:postgres@localhost:5432/amazing_db?schema=public).\n` +
        `      2. Ensure credentials, host, port, and database name are correctly specified.\n` +
        `  • Notice: Continuing with provided string, but database connections may fail.`
    );
    return raw.trim();
  }
  return result.data;
}
