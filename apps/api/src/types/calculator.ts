// src/types/domain.ts

/**
 * Supported discount rule types.
 */
export type DiscountType = 'MIN_TOTAL_AMOUNT' | 'MIN_QUANTITY' | 'MONTH_PERIOD';

/**
 * Base properties shared across all discount rule variations.
 */
interface BaseDiscountRule {
  readonly percentage: number;
}

/**
 * Rule triggered when the order base amount meets or exceeds a threshold.
 */
export interface MinTotalAmountDiscountRule extends BaseDiscountRule {
  readonly type: 'MIN_TOTAL_AMOUNT';
  readonly minAmount: number;
}

/**
 * Rule triggered when the ordered item count exceeds a threshold.
 */
export interface MinQuantityDiscountRule extends BaseDiscountRule {
  readonly type: 'MIN_QUANTITY';
  readonly minQuantity: number;
}

/**
 * Rule triggered when the order is placed within a specific calendar month.
 * Note: month is 1-indexed (1 = January, 9 = September, 11 = November).
 */
export interface MonthPeriodDiscountRule extends BaseDiscountRule {
  readonly type: 'MONTH_PERIOD';
  readonly month: number;
}

/**
 * Discriminated union of all available supplier discount policies.
 */
export type DiscountRule =
  | MinTotalAmountDiscountRule
  | MinQuantityDiscountRule
  | MonthPeriodDiscountRule;

/**
 * Article available in the shop catalog.
 */
export interface Article {
  readonly id: string;
  readonly name: string;
}

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
 * Parameters required to compute a replenishment comparison.
 */
export interface PurchaseOrderRequest {
  readonly articleId: string;
  readonly quantity: number;
  readonly orderDate: Date;
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
 * Reason an offer cannot fulfill the order.
 */
export interface ExcludedSupplier {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly reason: 'INSUFFICIENT_STOCK';
}

/**
 * Full output payload returned by the calculation engine.
 */
export interface ReplenishmentProposal {
  readonly requestedArticleId: string;
  readonly requestedQuantity: number;
  readonly orderDate: Date;
  readonly eligibleSuppliers: readonly SupplierEvaluation[];
  readonly excludedSuppliers: readonly ExcludedSupplier[];
}
