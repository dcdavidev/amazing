import { z } from 'zod';

const portSchema = z.coerce.number().int().min(1).max(65_535);

/**
 * Validates and parses the PORT variable.
 *
 * @param raw - Raw environment string.
 * @returns Validated port number.
 */
export function parsePort(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') {
    return 3000;
  }
  const result = portSchema.safeParse(raw.trim());
  if (!result.success) {
    console.error(
      `[Environment Validation Error] Invalid PORT: "${raw}".\n` +
        `  • Allowed values: Integer port number between 1 and 65535\n` +
        `  • Possible fix: Set PORT=3000 (or another valid port number) in apps/api/.env.\n` +
        `  • Fallback applied: 3000`
    );
    return 3000;
  }
  return result.data;
}
