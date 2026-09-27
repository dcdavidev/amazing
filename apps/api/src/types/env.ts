/**
 * Allowed application environment modes.
 */
export type NodeEnv = 'development' | 'production' | 'test';

/**
 * Allowed Pino logging severity levels.
 */
export type LogLevel =
  'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

/**
 * Validated application environment configuration type.
 */
export interface AppEnv {
  readonly NODE_ENV: NodeEnv;
  readonly PORT: number;
  readonly LOG_LEVEL: LogLevel;
  readonly DATABASE_URL: string;
  readonly ALLOWED_ORIGINS?: string;
}
