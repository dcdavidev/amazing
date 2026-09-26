import type { DatabaseStatus } from '../types/health.ts';
import { isDatabaseUrlSet } from './is-database-url-set.ts';
import { prisma } from './prisma.ts';

/**
 * Result of the database status evaluation.
 */
export interface DatabaseStatusResult {
  readonly status: DatabaseStatus;
  readonly isRunning: boolean;
  readonly errorDetails?: string;
  readonly troubleshooting: readonly string[];
}

/**
 * Evaluates the status of the PostgreSQL database connection and migrations table.
 *
 * This function performs diagnostic health checks without generating side-effect
 * logging, leaving logging responsibilities to middleware or callers.
 *
 * Checks performed:
 * 1. Existence and non-emptiness of `DATABASE_URL`.
 * 2. URL protocol scheme validation (`postgres:` or `postgresql:`).
 * 3. URL host and database path validation.
 * 4. Database connectivity and query execution.
 * 5. Presence of migrations table (`_prisma_migrations` or `migrations`).
 *
 * @returns Promise resolving to the evaluated database status result.
 */
export async function checkDatabaseStatus(): Promise<DatabaseStatusResult> {
  if (!isDatabaseUrlSet()) {
    return {
      status: 'malformed',
      isRunning: false,
      errorDetails:
        'DATABASE_URL environment variable is not defined or is empty.',
      troubleshooting: [
        'Set DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amazing_db?schema=public" in apps/api/.env',
        'Run "pnpm db:setup" from the repository root to start and initialize the database.',
      ],
    };
  }

  const dbUrl = process.env.DATABASE_URL as string;

  try {
    const parsed = new URL(dbUrl);

    if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
      return {
        status: 'malformed',
        isRunning: false,
        errorDetails: `Invalid DATABASE_URL protocol: "${parsed.protocol}". Expected "postgres:" or "postgresql:".`,
        troubleshooting: [
          'Update DATABASE_URL in apps/api/.env with a valid PostgreSQL URL scheme ("postgresql://" or "postgres://").',
        ],
      };
    }

    if (!parsed.hostname) {
      return {
        status: 'malformed',
        isRunning: false,
        errorDetails: 'DATABASE_URL is missing a valid hostname.',
        troubleshooting: [
          'Ensure DATABASE_URL includes host and port (e.g., localhost:5432).',
        ],
      };
    }

    if (!parsed.pathname || parsed.pathname === '/') {
      return {
        status: 'malformed',
        isRunning: false,
        errorDetails: 'DATABASE_URL is missing a database name.',
        troubleshooting: [
          'Specify a database name in DATABASE_URL (e.g., /amazing_db).',
        ],
      };
    }
  } catch {
    return {
      status: 'malformed',
      isRunning: false,
      errorDetails:
        'DATABASE_URL format is invalid. Unable to parse as a valid URL.',
      troubleshooting: [
        'Check apps/api/.env and ensure DATABASE_URL follows standard URL format (e.g. postgresql://user:pass@host:5432/dbname).',
      ],
    };
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('_prisma_migrations', 'migrations')
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return {
        status: 'out of sync',
        isRunning: false,
        errorDetails:
          'Database is reachable, but the migrations table ("_prisma_migrations" or "migrations") was not found.',
        troubleshooting: [
          'Run "pnpm db:setup" (or "pnpm exec prisma migrate dev" in apps/api) to apply Prisma migrations.',
          'Run "pnpm prisma:generate" if Prisma client is out of date.',
          'Check prisma/schema.prisma and database permissions.',
        ],
      };
    }

    return {
      status: 'running',
      isRunning: true,
      troubleshooting: [],
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';

    const isUnreachable =
      code === 'P1001' ||
      code === 'P1002' ||
      message.includes("Can't reach database server") ||
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT') ||
      message.includes('ENOTFOUND') ||
      message.includes('EHOSTUNREACH') ||
      message.includes('connection refused');

    if (isUnreachable) {
      return {
        status: 'not reachable',
        isRunning: false,
        errorDetails: `Database server is unreachable: ${message}`,
        troubleshooting: [
          'Make sure Docker is running on your machine.',
          'Start the PostgreSQL container with "pnpm db:start" or "pnpm db:setup".',
          'Check apps/api/.env and ensure DATABASE_URL has valid host, port, credentials, and database name.',
          'Check container logs using "docker compose -f apps/api/docker-compose.yml logs".',
          'Ensure port 5432 is not occupied by another PostgreSQL instance or blocked by a firewall.',
        ],
      };
    }

    const isMalformedAuth =
      code === 'P1000' ||
      code === 'P1003' ||
      code === 'P1013' ||
      message.includes('password authentication failed') ||
      message.includes('SASL') ||
      message.includes('SCRAM') ||
      message.includes('malformed') ||
      (message.includes('database') && message.includes('does not exist'));

    return {
      status: isMalformedAuth ? 'malformed' : 'not reachable',
      isRunning: false,
      errorDetails: `Database query failed: ${message}`,
      troubleshooting: [
        'Check database credentials and connection string in apps/api/.env.',
        'Run "pnpm db:setup" to reinitialize database and tables.',
      ],
    };
  }
}
