import type { Request, Response } from 'express';

import { calculateReplenishment } from '../lib/calculator.ts';
import { logger } from '../logger.ts';
import { getOffersByArticleId } from '../repositories/replenishment.repository.ts';
import type { PurchaseOrderRequest } from '../types/calculator.ts';

/**
 * Handles replenishment calculation for a requested article, quantity, and date.
 *
 * @param request - Incoming Express request containing order details.
 * @param response - Outgoing Express response returning evaluated proposals.
 * @returns Promise resolving when response is sent.
 */
export async function evaluateReplenishment(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { articleId, quantity, orderDate } = request.body as {
      readonly articleId?: unknown;
      readonly quantity?: unknown;
      readonly orderDate?: unknown;
    };

    if (typeof articleId !== 'string' || articleId.trim().length === 0) {
      response
        .status(400)
        .json({ error: 'Field "articleId" must be a non-empty string' });
      return;
    }

    if (
      typeof quantity !== 'number' ||
      quantity <= 0 ||
      !Number.isSafeInteger(quantity)
    ) {
      response
        .status(400)
        .json({ error: 'Field "quantity" must be a positive integer' });
      return;
    }

    let parsedDate = new Date();
    if (typeof orderDate === 'string' && orderDate.trim().length > 0) {
      const candidateDate = new Date(orderDate);
      if (Number.isNaN(candidateDate.getTime())) {
        response
          .status(400)
          .json({ error: 'Field "orderDate" must be a valid ISO date string' });
        return;
      }
      parsedDate = candidateDate;
    }

    const orderRequest: PurchaseOrderRequest = {
      articleId,
      quantity,
      orderDate: parsedDate,
    };

    const offers = await getOffersByArticleId(articleId);
    if (offers.length === 0) {
      response
        .status(404)
        .json({ error: 'No suppliers found for the requested article' });
      return;
    }

    const proposal = calculateReplenishment(orderRequest, offers);
    response.status(200).json(proposal);
  } catch (error: unknown) {
    logger.error(error, 'Failed to calculate replenishment proposal');
    response
      .status(500)
      .json({ error: 'Failed to calculate replenishment proposal' });
  }
}
