import express from 'express';

import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';

import compression from 'compression';
import hpp from 'hpp';

import { logger } from './logger.ts';
import { healthRouter } from './routes/health.route.ts';

/**
 * Express application instance.
 */
const app = express();

/**
 * Server listening port configured via environment variable or default fallback.
 */
const port = process.env.PORT ?? 3000;

/**
 * Allowed CORS origins, permitting local development environments
 * and configured production domains from the CORS_ORIGIN environment variable.
 */
const allowedOrigins: Array<string | RegExp> = [
  `http://localhost:${port}`,
  /^https?:\/\/localhost(?::\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];

app.use(pinoHttp({ logger }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  })
);

/**
 * Health check endpoint.
 */
app.use('/health', healthRouter);

/**
 * Root endpoint.
 */
app.get('/', (_request, response) => {
  response.json({ message: 'Hello from @amazing/api' });
});

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
