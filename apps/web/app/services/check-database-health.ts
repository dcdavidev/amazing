import { api } from '~/configs/api';
import type {
  ApiHealthResponse,
  DatabaseHealthResult,
  DatabaseHealthState,
} from '~/types/health';

/**
 * Checks the database health by inspecting the root endpoint of the API.
 *
 * Evaluates the `database` field within the root health payload. If the database
 * is reported as malformed, not reachable, out of sync, or if the API server
 * cannot be reached, it marks the health as unhealthy.
 *
 * @returns Promise resolving to the database health evaluation result.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  try {
    const response = await api.get<ApiHealthResponse>('/', {
      validateStatus: () => true,
      timeout: 5000,
    });

    const data = response.data;
    const rawDbStatus =
      data !== null && typeof data === 'object' ? data.database : undefined;

    if (rawDbStatus === 'running' && response.status === 200) {
      return {
        isHealthy: true,
        database: 'running',
      };
    }

    let databaseState: DatabaseHealthState = 'invalid';

    switch (rawDbStatus) {
      case 'malformed': {
        databaseState = 'malformed';
        break;
      }
      case 'not reachable': {
        databaseState = 'not reachable';
        break;
      }
      case 'out of sync': {
        databaseState = 'out of sync';
        break;
      }
      default: {
        databaseState = response.status >= 500 ? 'offline' : 'invalid';
        break;
      }
    }

    return {
      isHealthy: false,
      database: databaseState,
      message:
        typeof rawDbStatus === 'string'
          ? `Stato database segnalato: ${rawDbStatus}`
          : 'Risposta endpoint di verifica non valida o database non disponibile.',
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossibile raggiungere il server API.';

    return {
      isHealthy: false,
      database: 'offline',
      message,
    };
  }
}
