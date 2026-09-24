import { prisma } from '../lib/prisma.ts';
import type { ArticleWithPricing } from '../types/article.ts';

/**
 * Retrieves catalog articles with minimum available offer prices.
 *
 * @returns Promise resolving to the list of articles with pricing summary.
 */
export async function getArticles(): Promise<ArticleWithPricing[]> {
  const records = await prisma.article.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      offers: {
        select: {
          unitPrice: true,
          stockQuantity: true,
        },
      },
    },
  });

  return records.map((item) => {
    const inStockPrices = item.offers
      .filter((offer) => offer.stockQuantity > 0)
      .map((offer) => offer.unitPrice);
    const allPrices = item.offers.map((offer) => offer.unitPrice);
    const minPrice =
      inStockPrices.length > 0
        ? Math.min(...inStockPrices)
        : allPrices.length > 0
          ? Math.min(...allPrices)
          : null;

    return {
      id: item.id,
      name: item.name,
      minPrice,
      offersCount: item.offers.length,
    };
  });
}
