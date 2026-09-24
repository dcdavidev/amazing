/**
 * Supported discount rule types.
 */
export type DiscountType = 'MIN_TOTAL_AMOUNT' | 'MIN_QUANTITY' | 'MONTH_PERIOD';

/**
 * Base properties shared across all discount rule variations.
 */
export interface BaseDiscountRule {
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
 * Raw discount rule record from database representation.
 */
export interface RawDiscountRecord {
  readonly type: string;
  readonly percentage: number;
  readonly minAmount: number | null;
  readonly minQuantity: number | null;
  readonly month: number | null;
}
