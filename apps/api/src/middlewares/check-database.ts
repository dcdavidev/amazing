import type { NextFunction, Request, Response } from 'express';

import { checkDatabaseStatus } from '../lib/check-database-status.ts';
import { logger } from '../logger.ts';

/**
 * Middleware that verifies if the PostgreSQL database is reachable
 * and the migrations table exists.
 *
 * If the database check succeeds, execution continues to the next handler.
 * If the database is offline or the migrations table does not exist:
 * - Responds with HTTP 503 and a JSON error indicating `@amazing/api` is offline.
 * - Logs a warning to the terminal:
 *   - Concise offline warning if NODE_ENV=production.
 *   - Comprehensive diagnostic error and remediation steps if NODE_ENV=development.
 *
 * @param request - Incoming Express request.
 * @param response - Outgoing Express response.
 * @param next - Express next function.
 */
export async function checkDatabase(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  if (request.path === '/') {
    next();
    return;
  }

  const { isRunning, errorDetails, troubleshooting } =
    await checkDatabaseStatus();

  if (isRunning) {
    next();
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    logger.warn('@amazing/api is offline. Please try again later.');
  } else {
    const formattedTroubleshooting =
      troubleshooting.length > 0
        ? `\nPossible solutions:\n${troubleshooting.map((step, index) => `${index + 1}. ${step}`).join('\n')}`
        : '';
    logger.warn(
      `[Database Check Failed]: ${errorDetails ?? 'Service is offline'}${formattedTroubleshooting}`
    );
  }

  response.status(503).json({
    error: '@amazing/api is offline. Please try again later.',
  });
}
