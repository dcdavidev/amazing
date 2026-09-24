import { Router } from 'express';

import { evaluateReplenishment } from '../controllers/evaluate-replenishment.ts';

/**
 * Router exposing replenishment evaluation endpoints.
 */
export const replenishmentRouter: Router = Router().post(
  '/evaluate',
  evaluateReplenishment
);
