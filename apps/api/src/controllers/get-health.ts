import type { Request, Response } from 'express';

import { env } from '../configs/env.ts';
import { checkDatabaseStatus } from '../lib/check-database-status.ts';
import type { HealthStatus } from '../types/health.ts';

/**
 * Handles health check requests and returns system status metrics and database health.
 *
 * @param _request - Incoming Express request.
 * @param response - Outgoing Express response.
 * @returns Promise resolving when response is sent.
 */
export async function getHealth(
  _request: Request,
  response: Response
): Promise<void> {
  const { status, isRunning } = await checkDatabaseStatus();
  const memory = process.memoryUsage();

  const healthData: HealthStatus = {
    status: isRunning ? 'ok' : 'error',
    database: status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    memoryUsage: {
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      rss: memory.rss,
    },
  };

  response.status(isRunning ? 200 : 503).json(healthData);
}
