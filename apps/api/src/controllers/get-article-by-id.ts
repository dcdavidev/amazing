import type { Request, Response } from 'express';

import { logger } from '../logger.ts';
import { getArticleById as fetchArticleById } from '../repositories/get-article-by-id.ts';

/**
 * Handles GET /articles/:id request to retrieve an article and its supplier offers.
 *
 * @param request - Incoming Express request with article ID param.
 * @param response - Outgoing Express response.
 * @returns Promise resolving when response is sent.
 */
export async function getArticleById(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { id } = request.params;
    if (typeof id !== 'string' || id.trim().length === 0) {
      response.status(400).json({ error: 'Article ID is required' });
      return;
    }

    const article = await fetchArticleById(id);
    if (!article) {
      response.status(404).json({ error: 'Article not found' });
      return;
    }

    response.status(200).json(article);
  } catch (error: unknown) {
    logger.error(error, 'Failed to retrieve article');
    response.status(500).json({ error: 'Failed to retrieve article' });
  }
}
