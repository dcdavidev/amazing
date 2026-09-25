import type { Request, Response } from 'express';

import { logger } from '../logger.ts';
import { getArticles as fetchArticles } from '../repositories/get-articles.ts';

/**
 * Handles GET /articles request to retrieve available catalog articles.
 *
 * @param _request - Incoming Express request.
 * @param response - Outgoing Express response.
 * @returns Promise resolving when response is sent.
 */
export async function getArticles(
  _request: Request,
  response: Response
): Promise<void> {
  try {
    const articles = await fetchArticles();
    response.status(200).json(articles);
  } catch (error: unknown) {
    logger.error(error, 'Failed to retrieve articles');
    const details = error instanceof Error ? error.message : String(error);
    response.status(500).json({
      error: 'Impossibile recuperare gli articoli',
      details,
    });
  }
}
