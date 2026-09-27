/**
 * Seed discount rule representation matching domain discount types.
 */
export interface SeedDiscountRule {
  readonly type: 'MIN_TOTAL_AMOUNT' | 'MIN_QUANTITY' | 'MONTH_PERIOD';
  readonly percentage: number;
  readonly minAmount?: number;
  readonly minQuantity?: number;
  readonly month?: number;
}

/**
 * Seed configuration defining supplier details, catalog offer, and associated discount rules.
 */
export interface SeedSupplierConfig {
  readonly name: string;
  readonly minDaysToShip: number;
  readonly offer: {
    readonly unitPrice: number;
    readonly stockQuantity: number;
  };
  readonly discountRules: readonly SeedDiscountRule[];
}

/**
 * Attributes required to seed or verify an article.
 */
export interface SeedArticleInput {
  readonly name: string;
}

/**
 * Attributes required to seed or verify a supplier.
 */
export interface SeedSupplierInput {
  readonly name: string;
  readonly minDaysToShip: number;
}

/**
 * Attributes required to seed or verify a supplier offer.
 */
export interface SeedSupplierOfferInput {
  readonly supplierId: string;
  readonly articleId: string;
  readonly unitPrice: number;
  readonly stockQuantity: number;
}
