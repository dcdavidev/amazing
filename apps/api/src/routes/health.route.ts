import { Router } from 'express';

import { getHealth } from '../controllers/health.controller.ts';

/**
 * Health check router configured with health verification endpoints.
 */
export const healthRouter: Router = Router().get('/', getHealth);
