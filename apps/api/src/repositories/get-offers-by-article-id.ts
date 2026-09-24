import { prisma } from '../lib/prisma.ts';
import type { DiscountRule } from '../types/discount.ts';
import type { SupplierArticleOffer } from '../types/supplier.ts';
import { mapDiscountRecord } from './map-discount-record.ts';

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
