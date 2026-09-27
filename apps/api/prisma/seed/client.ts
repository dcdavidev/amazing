import '@dotenvx/dotenvx/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../src/models/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.trim() === '') {
  process.stderr.write(
    'Error: DATABASE_URL environment variable is not defined or is empty. Seeding aborted.\n' +
      'Please configure a valid PostgreSQL connection string in apps/api/.env\n'
  );
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

/**
 * Dedicated Prisma client instance for idempotent database seeding.
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});
