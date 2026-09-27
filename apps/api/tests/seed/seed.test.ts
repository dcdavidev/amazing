import { describe, expect, it, vi } from 'vitest';

import { seedArticles } from '../../prisma/seed/data/articles.ts';
import { SEED_DATA } from '../../prisma/seed/data/index.ts';
import { seedSuppliers } from '../../prisma/seed/data/suppliers.ts';
import type { SeedDiscountRule } from '../../prisma/seed/types.ts';
import { isDiscountRuleMatch } from '../../prisma/seed/upserters/is-discount-rule-match.ts';
import { upsertArticle } from '../../prisma/seed/upserters/upsert-article.ts';
import { upsertSupplier } from '../../prisma/seed/upserters/upsert-supplier.ts';
import { upsertSupplierOffer } from '../../prisma/seed/upserters/upsert-supplier-offer.ts';
import type {
  Article,
  DiscountRule,
  PrismaClient,
  Supplier,
  SupplierOffer,
} from '../../src/generated/prisma/client.js';

describe('Seed Data and Upserters', () => {
  describe('Seed Data Sets', () => {
    it('defines expected seed articles', () => {
      expect(seedArticles).toHaveLength(1);
      expect(seedArticles[0]?.name).toBe('Philips monitor 17"');
    });

    it('defines 3 suppliers with offers and rules', () => {
      expect(seedSuppliers).toHaveLength(3);
      for (const s of seedSuppliers) {
        expect(s.offer.unitPrice).toBeGreaterThan(0);
        expect(s.offer.stockQuantity).toBeGreaterThan(0);
      }
    });

    it('exports aggregated SEED_DATA', () => {
      expect(SEED_DATA.articles).toEqual(seedArticles);
      expect(SEED_DATA.suppliers).toEqual(seedSuppliers);
    });
  });

  describe('isDiscountRuleMatch', () => {
    const existing: DiscountRule = {
      id: 'rule-1',
      offerId: 'offer-1',
      type: 'MIN_TOTAL_AMOUNT',
      percentage: 5,
      minAmount: 1000,
      minQuantity: null,
      month: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expected: SeedDiscountRule = {
      type: 'MIN_TOTAL_AMOUNT',
      percentage: 5,
      minAmount: 1000,
    };

    it('returns true when all discount fields match', () => {
      expect(isDiscountRuleMatch(existing, expected)).toBe(true);
    });

    it('returns false when percentage or type differs', () => {
      expect(
        isDiscountRuleMatch(existing, { ...expected, percentage: 10 })
      ).toBe(false);
      expect(
        isDiscountRuleMatch(existing, { ...expected, type: 'MIN_QUANTITY' })
      ).toBe(false);
    });
  });

  describe('upsertArticle seeder', () => {
    it('returns existing article if already present in database', async () => {
      const mockArticle: Article = {
        id: 'existing-id',
        name: 'Philips monitor 17"',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockClient = {
        article: {
          findFirst: vi.fn().mockResolvedValue(mockArticle),
          create: vi.fn(),
        },
      } as unknown as PrismaClient;

      const result = await upsertArticle(
        { name: 'Philips monitor 17"' },
        mockClient
      );
      expect(result).toBe(mockArticle);
      expect(mockClient.article.create).not.toHaveBeenCalled();
    });

    it('creates article when not present', async () => {
      const createdArticle: Article = {
        id: 'new-id',
        name: 'New Item',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockClient = {
        article: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(createdArticle),
        },
      } as unknown as PrismaClient;

      const result = await upsertArticle({ name: 'New Item' }, mockClient);
      expect(result).toBe(createdArticle);
      expect(mockClient.article.create).toHaveBeenCalledWith({
        data: { name: 'New Item' },
      });
    });
  });

  describe('upsertSupplier seeder', () => {
    it('updates minDaysToShip if changed', async () => {
      const existingSupplier: Supplier = {
        id: 'sup-1',
        name: 'Supplier 1',
        minDaysToShip: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSupplier: Supplier = {
        ...existingSupplier,
        minDaysToShip: 5,
      };

      const mockClient = {
        supplier: {
          findFirst: vi.fn().mockResolvedValue(existingSupplier),
          update: vi.fn().mockResolvedValue(updatedSupplier),
        },
      } as unknown as PrismaClient;

      const result = await upsertSupplier(
        { name: 'Supplier 1', minDaysToShip: 5 },
        mockClient
      );
      expect(result.minDaysToShip).toBe(5);
      expect(mockClient.supplier.update).toHaveBeenCalled();
    });
  });

  describe('upsertSupplierOffer seeder', () => {
    it('creates offer when not existing', async () => {
      const createdOffer: SupplierOffer = {
        id: 'off-1',
        supplierId: 's1',
        articleId: 'a1',
        unitPrice: 120,
        stockQuantity: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockClient = {
        supplierOffer: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(createdOffer),
        },
      } as unknown as PrismaClient;

      const result = await upsertSupplierOffer(
        {
          supplierId: 's1',
          articleId: 'a1',
          unitPrice: 120,
          stockQuantity: 10,
        },
        mockClient
      );

      expect(result).toBe(createdOffer);
    });
  });
});
