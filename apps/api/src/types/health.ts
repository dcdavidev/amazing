/**
 * Health check response payload interface.
 */
export interface HealthStatus {
  readonly status: 'ok';
  readonly timestamp: string;
  readonly uptime: number;
  readonly environment: string;
  readonly memoryUsage: {
    readonly heapTotal: number;
    readonly heapUsed: number;
    readonly rss: number;
  };
}
