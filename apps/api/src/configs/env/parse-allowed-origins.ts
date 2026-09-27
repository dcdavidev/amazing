import { z } from 'zod';

const allowedOriginsSchema = z.string().refine((value) => {
  const trimmed = value.trim();
  if (trimmed === '*' || trimmed === '') {
    return true;
  }
  const entries = trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (entries.length === 0) {
    return true;
  }
  return entries.every((origin) => {
    if (origin === '*') {
      return true;
    }
    try {
      const parsed = new URL(origin);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  });
});

/**
 * Validates and parses ALLOWED_ORIGINS (or fallback CORS_ORIGIN).
 *
 * @param rawAllowed - Raw ALLOWED_ORIGINS string.
 * @param rawCors - Raw CORS_ORIGIN string fallback.
 * @returns Validated comma-separated origins or undefined.
 */
export function parseAllowedOrigins(
  rawAllowed: string | undefined,
  rawCors: string | undefined
): string | undefined {
  const raw = rawAllowed ?? rawCors;
  if (raw === undefined || raw.trim() === '') {
    return undefined;
  }
  const result = allowedOriginsSchema.safeParse(raw);
  if (!result.success) {
    console.error(
      `[Environment Validation Error] Invalid ALLOWED_ORIGINS: "${raw}".\n` +
        `  • Allowed values: '*' or a comma-separated list of valid HTTP/HTTPS URLs (e.g. "https://amazing-web-psi.vercel.app,http://localhost:5173")\n` +
        `  • Possible fix: Check apps/api/.env and ensure each origin includes the protocol (e.g. https://).\n` +
        `  • Fallback applied: using default localhost origins only.`
    );
    return undefined;
  }
  return raw.trim();
}
