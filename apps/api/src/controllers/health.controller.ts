import type { Request, Response } from 'express';

/**
 * Health check response payload interface.
 */
export interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptime: number;
  environment: string;
  memoryUsage: {
    heapTotal: number;
    heapUsed: number;
    rss: number;
  };
}

/**
 * Handles health check requests and returns system status metrics.
 *
 * @param _request - Incoming Express request.
 * @param response - Outgoing Express response.
 */
export function getHealth(_request: Request, response: Response): void {
  const memory = process.memoryUsage();

  const healthData: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV ?? 'development',
    memoryUsage: {
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      rss: memory.rss,
    },
  };

  response.status(200).json(healthData);
}
