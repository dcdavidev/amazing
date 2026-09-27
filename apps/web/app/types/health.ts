/**
 * Possible database statuses reported by the backend API health check or client evaluator.
 */
export type DatabaseHealthState =
  | 'running'
  | 'not reachable'
  | 'malformed'
  | 'out of sync'
  | 'offline'
  | 'invalid';

/**
 * Health check response structure returned by the root endpoint (GET /) of the API.
 */
export interface ApiHealthResponse {
  readonly status?: 'ok' | 'error' | string;
  readonly database?: string;
  readonly timestamp?: string;
  readonly uptime?: number;
  readonly environment?: string;
  readonly memoryUsage?: {
    readonly heapTotal?: number;
    readonly heapUsed?: number;
    readonly rss?: number;
  };
}

/**
 * Result of evaluating database health from the root API endpoint.
 */
export interface DatabaseHealthResult {
  readonly isHealthy: boolean;
  readonly database: DatabaseHealthState;
  readonly message?: string;
}
