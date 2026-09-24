import '@dotenvx/dotenvx/config';

import { prisma } from '../src/lib/prisma.js';
import type {
  Article,
  DiscountRule,
  Supplier,
  SupplierOffer,
} from '../src/models/prisma/client.js';

interface SeedDiscountRule {
  readonly type: 'MIN_TOTAL_AMOUNT' | 'MIN_QUANTITY' | 'MONTH_PERIOD';
  readonly percentage: number;
  readonly minAmount?: number;
  readonly minQuantity?: number;
  readonly month?: number;
}

interface SeedSupplierConfig {
  readonly name: string;
  readonly minDaysToShip: number;
  readonly offer: {
    readonly unitPrice: number;
    readonly stockQuantity: number;
  };
  readonly discountRules: readonly SeedDiscountRule[];
}

interface SeedArticleInput {
  readonly name: string;
}

interface SeedSupplierInput {
  readonly name: string;
  readonly minDaysToShip: number;
}

interface SeedSupplierOfferInput {
  readonly supplierId: string;
  readonly articleId: string;
  readonly unitPrice: number;
  readonly stockQuantity: number;
}

const SEED_DATA = {
  article: {
    name: 'Philips monitor 17"',
  },
  suppliers: [
    {
      name: 'Supplier 1',
      minDaysToShip: 5,
      offer: {
        unitPrice: 120,
        stockQuantity: 8,
      },
      discountRules: [
        {
          type: 'MIN_TOTAL_AMOUNT',
          percentage: 5,
          minAmount: 1000,
        },
      ],
    },
    {
      name: 'Supplier 2',
      minDaysToShip: 7,
      offer: {
        unitPrice: 128,
        stockQuantity: 15,
      },
      discountRules: [
        {
          type: 'MIN_QUANTITY',
          percentage: 3,
          minQuantity: 5,
        },
        {
          type: 'MIN_QUANTITY',
          percentage: 5,
          minQuantity: 10,
        },
      ],
    },
    {
      name: 'Supplier 3',
      minDaysToShip: 4,
      offer: {
        unitPrice: 129,
        stockQuantity: 23,
      },
      discountRules: [
        {
          type: 'MIN_TOTAL_AMOUNT',
          percentage: 5,
          minAmount: 1000,
        },
        {
          type: 'MONTH_PERIOD',
          percentage: 2,
          month: 9, // September
        },
      ],
    },
  ],
} as const satisfies {
  article: SeedArticleInput;
  suppliers: readonly SeedSupplierConfig[];
};

/**
 * Upserts the base catalog article if it does not already exist.
 *
 * @param input - Article creation attributes.
 * @returns Promise resolving to the retrieved or created article.
 */
async function upsertArticle(input: SeedArticleInput): Promise<Article> {
  const existing = await prisma.article.findFirst({
    where: {
      name: input.name,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.article.create({
    data: {
      name: input.name,
    },
  });
}

/**
 * Checks if the supplier exists and has correct attributes, upserting when necessary.
 *
 * @param input - Supplier attributes to verify or persist.
 * @returns Promise resolving to the verified or updated supplier.
 */
async function upsertSupplier(input: SeedSupplierInput): Promise<Supplier> {
  const existing = await prisma.supplier.findFirst({
    where: {
      name: input.name,
    },
  });

  if (!existing) {
    return prisma.supplier.create({
      data: {
        name: input.name,
        minDaysToShip: input.minDaysToShip,
      },
    });
  }

  if (existing.minDaysToShip !== input.minDaysToShip) {
    return prisma.supplier.update({
      where: {
        id: existing.id,
      },
      data: {
        minDaysToShip: input.minDaysToShip,
      },
    });
  }

  return existing;
}

/**
 * Checks if the supplier offer exists and matches expected pricing and inventory, upserting when necessary.
 *
 * @param input - Offer attributes to verify or persist.
 * @returns Promise resolving to the verified or updated supplier offer.
 */
async function upsertSupplierOffer(
  input: SeedSupplierOfferInput
): Promise<SupplierOffer> {
  const existing = await prisma.supplierOffer.findUnique({
    where: {
      supplierId_articleId: {
        supplierId: input.supplierId,
        articleId: input.articleId,
      },
    },
  });

  if (!existing) {
    return prisma.supplierOffer.create({
      data: {
        supplierId: input.supplierId,
        articleId: input.articleId,
        unitPrice: input.unitPrice,
        stockQuantity: input.stockQuantity,
      },
    });
  }

  if (
    existing.unitPrice !== input.unitPrice ||
    existing.stockQuantity !== input.stockQuantity
  ) {
    return prisma.supplierOffer.update({
      where: {
        id: existing.id,
      },
      data: {
        unitPrice: input.unitPrice,
        stockQuantity: input.stockQuantity,
      },
    });
  }

  return existing;
}

/**
 * Determines whether an existing discount rule record matches the expected rule values exactly.
 *
 * @param existing - Existing discount rule record from database.
 * @param expected - Expected discount rule configuration.
 * @returns True if all fields match, false otherwise.
 */
function isDiscountRuleMatch(
  existing: DiscountRule,
  expected: SeedDiscountRule
): boolean {
  return (
    existing.type === expected.type &&
    existing.percentage === expected.percentage &&
    (existing.minAmount ?? undefined) === expected.minAmount &&
    (existing.minQuantity ?? undefined) === expected.minQuantity &&
    (existing.month ?? undefined) === expected.month
  );
}

/**
 * Checks if discount rules are present and correct for an offer, upserting any missing or outdated rules.
 *
 * @param offerId - Target supplier offer identifier.
 * @param expectedRules - List of expected discount rule configurations.
 * @returns Promise resolving when all rules are verified or upserted.
 */
async function upsertDiscountRules(
  offerId: string,
  expectedRules: readonly SeedDiscountRule[]
): Promise<void> {
  const existingRules = await prisma.discountRule.findMany({
    where: {
      offerId,
    },
  });

  const claimedRuleIds = new Set<string>();

  for (const expected of expectedRules) {
    // 1. Check if an exact match already exists
    const exactMatch = existingRules.find(
      (candidate) =>
        !claimedRuleIds.has(candidate.id) &&
        isDiscountRuleMatch(candidate, expected)
    );

    if (exactMatch) {
      claimedRuleIds.add(exactMatch.id);
      continue;
    }

    // 2. Look for a candidate rule to update
    const candidateMatch =
      existingRules.find((candidate) => {
        if (
          claimedRuleIds.has(candidate.id) ||
          candidate.type !== expected.type
        ) {
          return false;
        }

        if (expected.type === 'MIN_QUANTITY') {
          return candidate.minQuantity === (expected.minQuantity ?? null);
        }

        return expected.type === 'MIN_TOTAL_AMOUNT'
          ? candidate.minAmount === (expected.minAmount ?? null)
          : expected.type === 'MONTH_PERIOD' &&
              candidate.month === (expected.month ?? null);
      }) ??
      existingRules.find(
        (candidate) =>
          !claimedRuleIds.has(candidate.id) && candidate.type === expected.type
      );

    if (candidateMatch) {
      claimedRuleIds.add(candidateMatch.id);
      await prisma.discountRule.update({
        where: {
          id: candidateMatch.id,
        },
        data: {
          type: expected.type,
          percentage: expected.percentage,
          minAmount: expected.minAmount ?? null,
          minQuantity: expected.minQuantity ?? null,
          month: expected.month ?? null,
        },
      });
    } else {
      const created = await prisma.discountRule.create({
        data: {
          offerId,
          type: expected.type,
          percentage: expected.percentage,
          minAmount: expected.minAmount ?? null,
          minQuantity: expected.minQuantity ?? null,
          month: expected.month ?? null,
        },
      });
      claimedRuleIds.add(created.id);
    }
  }
}

/**
 * Seeds initial catalog, supplier offers, and discount criteria idempotently.
 *
 * @returns Promise resolved when the database population completes.
 */
async function main(): Promise<void> {
  const monitor = await upsertArticle(SEED_DATA.article);

  for (const supplierConfig of SEED_DATA.suppliers) {
    const supplier = await upsertSupplier({
      name: supplierConfig.name,
      minDaysToShip: supplierConfig.minDaysToShip,
    });

    const offer = await upsertSupplierOffer({
      supplierId: supplier.id,
      articleId: monitor.id,
      unitPrice: supplierConfig.offer.unitPrice,
      stockQuantity: supplierConfig.offer.stockQuantity,
    });

    await upsertDiscountRules(offer.id, supplierConfig.discountRules);
  }
}

try {
  await main();
} catch (error: unknown) {
  process.stderr.write(`Seeding failed: ${String(error)}\n`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
