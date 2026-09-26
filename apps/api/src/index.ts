import '@dotenvx/dotenvx/config';

import express from 'express';

import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import compression from 'compression';
import hpp from 'hpp';

import { allowedOrigins } from './configs/allowed-origins.ts';
import { port } from './configs/port.ts';
import { getHealth } from './controllers/get-health.ts';
import { setupGracefulShutdown } from './lib/setup-graceful-shutdown.ts';
import { startServer } from './lib/start-server.ts';
import { checkDatabase } from './middlewares/check-database.ts';
import { articleRouter } from './routes/article.ts';
import { replenishmentRouter } from './routes/replenishment.ts';

/**
 * Express application instance.
 */
const app = express();

/**
 * Enable CORS for allowed origins with credentials support.
 */
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/**
 * Compress HTTP response bodies using Gzip/Deflate.
 */
app.use(compression());

/**
 * Parse incoming JSON request payloads into request.body.
 */
app.use(express.json());

/**
 * Parse URL-encoded form data into request.body.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Protect against HTTP Parameter Pollution attacks.
 */
app.use(hpp());

/**
 * Rate limit requests to prevent abuse and DDoS.
 */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  })
);

/**
 * Database availability and migrations check middleware.
 */
app.use(checkDatabase);

/**
 * Catalog articles endpoints.
 */
app.use('/articles', articleRouter);

/**
 * Replenishment calculation endpoints.
 */
app.use('/replenishment', replenishmentRouter);

/**
 * Root health check endpoint.
 */
app.get('/', getHealth);

/**
 * Start HTTP server with startup error handling.
 */
const server = startServer(app, port);

/**
 * Register graceful shutdown signal listeners.
 */
setupGracefulShutdown(server);
