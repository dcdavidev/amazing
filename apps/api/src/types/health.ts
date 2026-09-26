/**
 * Database availability and schema health status.
 */
export type DatabaseStatus =
  'running' | 'not reachable' | 'malformed' | 'out of sync';

/**
 * Health check response payload interface.
 */
export interface HealthStatus {
  readonly status: 'ok' | 'error';
  readonly database: DatabaseStatus;
  readonly timestamp: string;
  readonly uptime: number;
  readonly environment: string;
  readonly memoryUsage: {
    readonly heapTotal: number;
    readonly heapUsed: number;
    readonly rss: number;
  };
}
