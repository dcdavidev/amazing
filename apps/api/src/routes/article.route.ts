import { Router } from 'express';

import { getArticles } from '../controllers/article.controller.ts';

/**
 * Router exposing catalog article endpoints.
 */
export const articleRouter: Router = Router().get('/', getArticles);
