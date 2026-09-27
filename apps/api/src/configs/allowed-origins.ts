import { env } from './env.ts';
import { port } from './port.ts';

/**
 * Origins string retrieved and validated from environment variables.
 * Falls back to undefined if neither variable is set or valid.
 */
const envOrigins: string | undefined = env.ALLOWED_ORIGINS;

/**
 * Allowed CORS origins configuration.
 *
 * Local development note:
 *   All localhost and 127.0.0.1 ports (e.g. `http://localhost:5173`, `http://localhost:3000`)
 *   are already permitted by default via regular expressions. It is not necessary to add
 *   local origins to ALLOWED_ORIGINS during development.
 *
 * Purpose of ALLOWED_ORIGINS:
 *   - Production / Staging: Authorize deployed frontend domains (e.g. `https://amazing-web-psi.vercel.app`).
 *   - Local Area Network (LAN): Authorize local IP addresses when testing on other devices (e.g. `http://192.168.1.45:5173`).
 *   - Tunneling: Authorize tunneling services (e.g. `https://your-preview.ngrok-free.app`).
 *
 * Usage:
 *   Set ALLOWED_ORIGINS in `apps/api/.env` as a comma-separated list of origins:
 *   e.g. ALLOWED_ORIGINS=https://amazing-web-psi.vercel.app
 */
export const allowedOrigins: Array<string | RegExp> = [
  `http://localhost:${port}`,
  /^https?:\/\/localhost(?::\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
  ...(envOrigins ? envOrigins.split(',') : []),
];
