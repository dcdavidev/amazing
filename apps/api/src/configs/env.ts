import { validateEnv } from './env/validate-env.ts';

export type { AppEnv, LogLevel, NodeEnv } from '../types/env.ts';
export { validateEnv } from './env/validate-env.ts';

/**
 * Singleton validated environment configuration for the application runtime.
 */
export const env = validateEnv();
