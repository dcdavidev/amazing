import { Router } from 'express';

import { getArticleById } from '../controllers/get-article-by-id.ts';
import { getArticles } from '../controllers/get-articles.ts';

/**
 * Router exposing catalog article endpoints.
 */
export const articleRouter: Router = Router()
  .get('/', getArticles)
  .get('/:id', getArticleById);
