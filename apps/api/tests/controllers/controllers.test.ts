import type { Request, Response } from 'express';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { evaluateReplenishment } from '../../src/controllers/evaluate-replenishment.ts';
import { getArticleById } from '../../src/controllers/get-article-by-id.ts';
import { getArticles } from '../../src/controllers/get-articles.ts';
import * as getArticleByIdRepo from '../../src/repositories/get-article-by-id.ts';
import * as getArticlesRepo from '../../src/repositories/get-articles.ts';
import * as getOffersRepo from '../../src/repositories/get-offers-by-article-id.ts';

/**
 * Creates mocked Express response with spy methods for testing.
 *
 * @returns Object containing response and spy functions.
 */
function createMockResponse(): {
  res: Response;
  statusMock: ReturnType<typeof vi.fn>;
  jsonMock: ReturnType<typeof vi.fn>;
} {
  const jsonMock = vi.fn();
  const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
  const res = { status: statusMock } as unknown as Response;
  return { res, statusMock, jsonMock };
}

describe('Controllers Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getArticles', () => {
    it('returns 200 with list of articles', async () => {
      const { res, statusMock, jsonMock } = createMockResponse();
      const mockArticles = [
        { id: '1', name: 'Monitor', minPrice: 120, offersCount: 3 },
      ];
      vi.spyOn(getArticlesRepo, 'getArticles').mockResolvedValue(mockArticles);

      await getArticles({} as Request, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockArticles);
    });

    it('returns 500 when repository throws an error', async () => {
      const { res, statusMock, jsonMock } = createMockResponse();
      vi.spyOn(getArticlesRepo, 'getArticles').mockRejectedValue(
        new Error('DB failure')
      );

      await getArticles({} as Request, res);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Impossibile recuperare gli articoli',
        })
      );
    });
  });

  describe('getArticleById', () => {
    it('returns 400 if id is missing or whitespace', async () => {
      const { res, statusMock, jsonMock } = createMockResponse();
      const req = { params: { id: ' '.repeat(3) } } as unknown as Request;

      await getArticleById(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "L'ID dell'articolo è obbligatorio",
      });
    });

    it('returns 404 if article is not found', async () => {
      const { res, statusMock, jsonMock } = createMockResponse();
      const req = { params: { id: 'missing-id' } } as unknown as Request;
      vi.spyOn(getArticleByIdRepo, 'getArticleById').mockResolvedValue(null);

      await getArticleById(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Articolo non trovato',
      });
    });

    it('returns 200 with article details when found', async () => {
      const { res, statusMock, jsonMock } = createMockResponse();
      const req = { params: { id: 'art-1' } } as unknown as Request;
      const articleData = { id: 'art-1', name: 'Monitor', offers: [] };
      vi.spyOn(getArticleByIdRepo, 'getArticleById').mockResolvedValue(
        articleData
      );

      await getArticleById(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(articleData);
    });
  });

  describe('evaluateReplenishment', () => {
    it('returns 400 if articleId is missing or empty', async () => {
      const { res, statusMock, jsonMock } = createMockResponse();
      const req = {
        body: { articleId: '', quantity: 5 },
      } as unknown as Request;

      await evaluateReplenishment(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Il campo "articleId" deve essere una stringa non vuota',
      });
    });

    it('returns 400 if quantity is not a positive integer', async () => {
      const { res, statusMock } = createMockResponse();
      const req = {
        body: { articleId: 'art-1', quantity: -3 },
      } as unknown as Request;

      await evaluateReplenishment(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('returns 400 if orderDate is not a valid date string', async () => {
      const { res, statusMock } = createMockResponse();
      const req = {
        body: {
          articleId: 'art-1',
          quantity: 5,
          orderDate: 'not-a-date',
        },
      } as unknown as Request;

      await evaluateReplenishment(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('returns 404 if no supplier offers are found for the article', async () => {
      const { res, statusMock, jsonMock } = createMockResponse();
      const req = {
        body: { articleId: 'art-1', quantity: 5 },
      } as unknown as Request;
      vi.spyOn(getOffersRepo, 'getOffersByArticleId').mockResolvedValue([]);

      await evaluateReplenishment(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Nessun fornitore trovato per l'articolo richiesto",
      });
    });

    it('returns 200 with replenishment proposal when valid', async () => {
      const { res, statusMock, jsonMock } = createMockResponse();
      const req = {
        body: {
          articleId: 'art-1',
          quantity: 5,
          orderDate: '2026-09-10T00:00:00Z',
        },
      } as unknown as Request;

      vi.spyOn(getOffersRepo, 'getOffersByArticleId').mockResolvedValue([
        {
          supplierId: 's1',
          supplierName: 'Supplier 1',
          minDaysToShip: 5,
          unitPrice: 120,
          stockQuantity: 10,
          discountRules: [],
        },
      ]);

      await evaluateReplenishment(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          requestedArticleId: 'art-1',
          requestedQuantity: 5,
        })
      );
    });
  });
});
