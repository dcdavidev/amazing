/// <reference types="node" />
/* eslint-disable jsdoc/check-tag-names */
// cspell:ignore isready fileoverview
/**
 * @fileoverview Automated setup script for the local development PostgreSQL database.
 *
 * Why this script was created:
 * This script automates the initial bootstrapping process for the local PostgreSQL database
 * in development environments. It starts the container via Docker Compose, polls until the
 * database is healthy and ready to accept connections, and runs Prisma migrations (`prisma:migrate`)
 * to initialize the database schema and populate seed data.
 *
 * How to use:
 *   - From apps/api: `pnpm db:setup`
 *   - From monorepo root: `pnpm --filter @amazing/api db:setup`
 *
 * Requirements / Warning:
 *   Docker must be installed and running on the host system for this script to work.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWin = process.platform === 'win32';

/**
 * Checks whether Docker is installed and accessible in the system PATH.
 *
 * @returns A promise that resolves to true if Docker is found, false otherwise.
 */
function checkDockerInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('docker', ['--version'], {
      stdio: 'ignore',
    });

    child.on('error', () => {
      resolve(false);
    });

    child.on('close', (code: number | null) => {
      resolve(code === 0);
    });
  });
}

/**
 * Executes a shell command and waits for its completion.
 *
 * @param command - The command binary to execute.
 * @param args - The arguments passed to the command.
 * @returns A promise that resolves when the command completes with code 0.
 */
function runCommand(command: string, args: string[]): Promise<void> {
  const cmd = isWin && command === 'pnpm' ? 'pnpm.cmd' : command;
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: __dirname,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code: number | null) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Command "${command} ${args.join(' ')}" exited with code ${code}`
          )
        );
      }
    });
  });
}

/**
 * Checks if the PostgreSQL database service is ready to accept connections.
 *
 * @returns A promise that resolves to true if PostgreSQL is ready, false otherwise.
 */
function checkDatabaseReady(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(
      'docker',
      [
        'compose',
        'exec',
        '-T',
        'postgres',
        'pg_isready',
        '-U',
        'postgres',
        '-d',
        'amazing_db',
      ],
      {
        cwd: __dirname,
        stdio: 'pipe',
      }
    );

    child.on('close', (code: number | null) => {
      resolve(code === 0);
    });

    child.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Waits for the PostgreSQL database service to become ready.
 *
 * @param maxAttempts - Maximum number of polling attempts.
 * @param intervalMs - Polling interval in milliseconds.
 * @returns A promise that resolves when PostgreSQL is ready.
 */
async function waitForDatabase(
  maxAttempts = 30,
  intervalMs = 1000
): Promise<void> {
  console.log('Step 2/3: Waiting for PostgreSQL database to be ready...');
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isReady = await checkDatabaseReady();
    if (isReady) {
      console.log('PostgreSQL database is ready!');
      return;
    }
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  throw new Error('Timeout: database did not become ready within 30 seconds.');
}

// 1. Docker check-up before all other operations
console.log('Checking Docker installation...');
const isDockerAvailable = await checkDockerInstalled();

if (!isDockerAvailable) {
  console.error(
    'Docker not found. Please install it before running this script.'
  );
  throw new Error('Docker is not installed or not accessible in PATH.');
}

console.log('Docker found, bootstrapping the postgres database...');

// 2. Start PostgreSQL container
console.log('Step 1/3: Starting PostgreSQL container with Docker Compose...');
await runCommand('docker', ['compose', 'up', '-d']);

// 3. Wait for PostgreSQL readiness
await waitForDatabase();

// 4. Run Prisma migrations and seed
console.log('Step 3/3: Running Prisma migrations (prisma:migrate)...');
await runCommand('pnpm', ['run', 'prisma:migrate']);

// 5. Output connection string and .env suggestion
const connectionString =
  'postgresql://postgres:postgres@localhost:5432/amazing_db?schema=public';

console.log('\nPostgreSQL started and migrations applied successfully!');
console.log('Connection string:');
console.log(`  ${connectionString}`);
console.log(
  '\nPlease ensure your apps/api/.env file includes the DATABASE_URL variable:'
);
console.log(`  DATABASE_URL="${connectionString}"\n`);
