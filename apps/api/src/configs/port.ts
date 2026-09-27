import { env } from './env.ts';

/**
 * Server listening port configured via environment variable or default fallback.
 * To change the port from the default 3000, set the PORT variable in `apps/api/.env`.
 */
export const port: number = env.PORT;
