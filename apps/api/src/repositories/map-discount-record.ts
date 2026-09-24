import type {
  DiscountRule,
  MinQuantityDiscountRule,
  MinTotalAmountDiscountRule,
  MonthPeriodDiscountRule,
  RawDiscountRecord,
} from '../types/discount.ts';

/**
 * Maps database discount records to domain typed discount rules.
 *
 * @param record - Raw discount rule entry from database.
 * @returns Strongly typed DiscountRule union variant or null if invalid.
 */
export function mapDiscountRecord(
  record: RawDiscountRecord
): DiscountRule | null {
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
