import type { Request, Response } from 'express';

import { calculateReplenishment } from '../lib/replenishment.ts';
import { logger } from '../logger.ts';
import { getOffersByArticleId } from '../repositories/get-offers-by-article-id.ts';
import type {
  EvaluateReplenishmentBody,
  PurchaseOrderRequest,
} from '../types/replenishment.ts';

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
    const { articleId, quantity, orderDate } =
      request.body as EvaluateReplenishmentBody;

    if (typeof articleId !== 'string' || articleId.trim().length === 0) {
      response.status(400).json({
        error: 'Il campo "articleId" deve essere una stringa non vuota',
      });
      return;
    }

    if (
      typeof quantity !== 'number' ||
      quantity <= 0 ||
      !Number.isSafeInteger(quantity)
    ) {
      response
        .status(400)
        .json({ error: 'Il campo "quantity" deve essere un intero positivo' });
      return;
    }

    let parsedDate = new Date();
    if (typeof orderDate === 'string' && orderDate.trim().length > 0) {
      const candidateDate = new Date(orderDate);
      if (Number.isNaN(candidateDate.getTime())) {
        response.status(400).json({
          error:
            'Il campo "orderDate" deve essere una stringa di data ISO valida',
        });
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
      response.status(404).json({
        error: "Nessun fornitore trovato per l'articolo richiesto",
      });
      return;
    }

    const proposal = calculateReplenishment(orderRequest, offers);
    response.status(200).json(proposal);
  } catch (error: unknown) {
    logger.error(error, 'Failed to calculate replenishment proposal');
    response
      .status(500)
      .json({ error: 'Impossibile calcolare la proposta di rifornimento' });
  }
}
