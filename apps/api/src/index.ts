import './configs/load-env.ts';

import { createApp } from './app.ts';
import { port } from './configs/port.ts';
import { setupGracefulShutdown } from './lib/setup-graceful-shutdown.ts';
import { startServer } from './lib/start-server.ts';

/**
 * Start HTTP server with startup error handling.
 */
const server = startServer(createApp(), port);

/**
 * Register graceful shutdown signal listeners.
 */
setupGracefulShutdown(server);
