import type { AppEnv } from '../../types/env.ts';
import { parseAllowedOrigins } from './parse-allowed-origins.ts';
import { parseDatabaseUrl } from './parse-database-url.ts';
import { parseLogLevel } from './parse-log-level.ts';
import { parseNodeEnv } from './parse-node-env.ts';
import { parsePort } from './parse-port.ts';

/**
 * Validates environment variables against allowed schemas using Zod.
 * Logs informative console.error messages with actionable fixes without throwing errors.
 *
 * @param source - Environment variables map (defaults to process.env).
 * @returns Validated environment configuration with safe fallbacks applied.
 */
export function validateEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const nodeEnv = parseNodeEnv(source['NODE_ENV']);
  const port = parsePort(source['PORT']);
  const logLevel = parseLogLevel(source['LOG_LEVEL'], nodeEnv);
  const databaseUrl = parseDatabaseUrl(source['DATABASE_URL']);
  const allowedOrigins = parseAllowedOrigins(
    source['ALLOWED_ORIGINS'],
    source['CORS_ORIGIN']
  );

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    LOG_LEVEL: logLevel,
    DATABASE_URL: databaseUrl,
    ALLOWED_ORIGINS: allowedOrigins,
  };
}
