import type { SupplierArticleOffer } from './supplier.ts';

/**
 * Article available in the shop catalog.
 */
export interface Article {
  readonly id: string;
  readonly name: string;
}

/**
 * Article catalog entry enhanced with minimum price summary.
 */
export interface ArticleWithPricing extends Article {
  readonly minPrice: number | null;
  readonly offersCount: number;
}

/**
 * Detailed article catalog entry with associated supplier offers.
 */
export interface ArticleDetail extends Article {
  readonly offers: readonly SupplierArticleOffer[];
}
