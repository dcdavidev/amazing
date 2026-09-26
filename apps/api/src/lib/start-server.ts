import type { Server } from 'node:http';

import type { Express } from 'express';

import { logger } from '../logger.ts';

/**
 * Starts the Express HTTP server with startup error handling.
 *
 * @param app - Express application instance to start.
 * @param port - TCP port number or string to listen on.
 * @returns Running HTTP server instance.
 */
export function startServer(app: Express, port: number | string): Server {
  const server = app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(
        `Port ${port} is already in use. Please choose another port.`
      );
    } else {
      logger.error(`Server startup failed: ${error.message}`);
    }
    process.exitCode = 1;
  });

  return server;
}
