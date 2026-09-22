import { prisma } from '../lib/prisma.ts';
import type {
  Article,
  DiscountRule,
  MinQuantityDiscountRule,
  MinTotalAmountDiscountRule,
  MonthPeriodDiscountRule,
  SupplierArticleOffer,
} from '../types/calculator.ts';

/**
 * Raw discount rule entry from database.
 */
interface RawDiscountRecord {
  readonly type: string;
  readonly percentage: number;
  readonly minAmount: number | null;
  readonly minQuantity: number | null;
  readonly month: number | null;
}

/**
 * Maps database discount records to domain typed discount rules.
 *
 * @param record - Raw discount rule entry from database.
 * @returns Strongly typed DiscountRule union variant or null if invalid.
 */
function mapDiscountRecord(record: RawDiscountRecord): DiscountRule | null {
  if (
    record.type === 'MIN_TOTAL_AMOUNT' &&
    typeof record.minAmount === 'number'
  ) {
    const rule: MinTotalAmountDiscountRule = {
      type: 'MIN_TOTAL_AMOUNT',
      percentage: record.percentage,
      minAmount: record.minAmount,
    };
    return rule;
  }

  if (
    record.type === 'MIN_QUANTITY' &&
    typeof record.minQuantity === 'number'
  ) {
    const rule: MinQuantityDiscountRule = {
      type: 'MIN_QUANTITY',
      percentage: record.percentage,
      minQuantity: record.minQuantity,
    };
    return rule;
  }

  if (record.type === 'MONTH_PERIOD' && typeof record.month === 'number') {
    const rule: MonthPeriodDiscountRule = {
      type: 'MONTH_PERIOD',
      percentage: record.percentage,
      month: record.month,
    };
    return rule;
  }

  return null;
}

/**
 * Retrieves catalog articles.
 *
 * @returns Promise resolving to the list of articles.
 */
export async function getArticles(): Promise<Article[]> {
  const records = await prisma.article.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return records.map((item) => ({
    id: item.id,
    name: item.name,
  }));
}

/**
 * Retrieves all supplier offers and their discount rules for a specific article.
 *
 * @param articleId - Target article unique identifier.
 * @returns Promise resolving to domain-ready supplier article offers.
 */
export async function getOffersByArticleId(
  articleId: string
): Promise<SupplierArticleOffer[]> {
  const offers = await prisma.supplierOffer.findMany({
    where: {
      articleId,
    },
    include: {
      supplier: true,
      discountRules: true,
    },
  });

  const domainOffers: SupplierArticleOffer[] = [];

  for (const offer of offers) {
    const parsedRules: DiscountRule[] = [];

    for (const rawRule of offer.discountRules) {
      const parsed = mapDiscountRecord(rawRule);
      if (parsed !== null) {
        parsedRules.push(parsed);
      }
    }

    domainOffers.push({
      supplierId: offer.supplier.id,
      supplierName: offer.supplier.name,
      unitPrice: offer.unitPrice,
      stockQuantity: offer.stockQuantity,
      minDaysToShip: offer.supplier.minDaysToShip,
      discountRules: parsedRules,
    });
  }

  return domainOffers;
}
