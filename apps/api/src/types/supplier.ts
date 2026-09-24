import type { DiscountRule } from './discount.ts';

/**
 * Specific supplier catalog entry with pricing, inventory, and discount terms.
 */
export interface SupplierArticleOffer {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly unitPrice: number;
  readonly stockQuantity: number;
  readonly minDaysToShip: number;
  readonly discountRules: readonly DiscountRule[];
}

/**
 * Evaluation breakdown for an individual eligible supplier.
 */
export interface SupplierEvaluation {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly minDaysToShip: number;
  readonly baseAmount: number;
  readonly totalDiscountPercentage: number;
  readonly finalAmount: number;
  readonly isCheapest: boolean;
}

/**
 * Reason a supplier offer cannot fulfill the order.
 */
export interface ExcludedSupplier {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly reason: 'INSUFFICIENT_STOCK';
}
