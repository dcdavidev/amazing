/**
 * Server listening port configured via environment variable or default fallback.
 * To change the port from the default 3000, set the PORT variable in `apps/api/.env`.
 */
export const port = process.env.PORT ?? 3000;
