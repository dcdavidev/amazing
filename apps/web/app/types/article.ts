/**
 * Supplier offer entry for an article.
 */
export interface ArticleSupplierOffer {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly unitPrice: number;
  readonly stockQuantity: number;
  readonly minDaysToShip: number;
}

/**
 * Article catalog item returned from backend.
 */
export interface ArticleOption {
  readonly id: string;
  readonly name: string;
  readonly minPrice?: number | null;
  readonly offersCount?: number;
}

/**
 * Detailed article view with all associated purchasing options.
 */
export interface ArticleDetail {
  readonly id: string;
  readonly name: string;
  readonly offers: readonly ArticleSupplierOffer[];
}
