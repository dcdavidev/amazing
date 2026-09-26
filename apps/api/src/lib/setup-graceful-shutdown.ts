import type { Server } from 'node:http';

import { logger } from '../logger.ts';
import { prisma } from './prisma.ts';

/**
 * Registers process signal listeners to gracefully shut down the server and database.
 *
 * @param server - The running HTTP server instance.
 */
export function setupGracefulShutdown(server: Server): void {
  let isShuttingDown = false;

  /**
   * Closes active connections and disconnects Prisma before process exit.
   *
   * @param signal - OS termination signal or error reason.
   */
  async function gracefulShutdown(signal: string): Promise<void> {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    logger.info(`Received ${signal}. Initiating graceful shutdown...`);

    /**
     * Safety timeout to forcefully close all connections if graceful shutdown hangs.
     */
    const forceTimeout = setTimeout(() => {
      logger.error('Graceful shutdown timed out after 10s. Forcing exit.');
      server.closeAllConnections();
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }, 10_000);
    forceTimeout.unref();

    /**
     * Close idle HTTP keep-alive connections immediately.
     */
    server.closeIdleConnections();

    /**
     * Stop accepting new HTTP requests and wait for active requests to finish.
     */
    server.close(async (closeError) => {
      if (closeError) {
        logger.error(`Error closing HTTP server: ${closeError.message}`);
        process.exitCode = 1;
      } else {
        logger.info('HTTP server closed successfully.');
      }

      try {
        await prisma.$disconnect();
        logger.info('Database connection closed.');
      } catch (databaseError) {
        const message =
          databaseError instanceof Error
            ? databaseError.message
            : String(databaseError);
        logger.error(`Error disconnecting database: ${message}`);
        process.exitCode = 1;
      }
    });
  }

  process.on('SIGTERM', () => {
    void gracefulShutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void gracefulShutdown('SIGINT');
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    void gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    logger.error(`Unhandled rejection: ${message}`);
    void gracefulShutdown('unhandledRejection');
  });
}
