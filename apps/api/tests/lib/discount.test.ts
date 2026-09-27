import { describe, expect, it } from 'vitest';

import { determineApplicableDiscounts } from '../../src/lib/discount.ts';
import type { DiscountRule } from '../../src/types/discount.ts';

describe('determineApplicableDiscounts', () => {
  const rules: DiscountRule[] = [
    { type: 'MIN_QUANTITY', percentage: 3, minQuantity: 5 },
    { type: 'MIN_QUANTITY', percentage: 5, minQuantity: 10 },
    { type: 'MIN_TOTAL_AMOUNT', percentage: 5, minAmount: 1000 },
    { type: 'MONTH_PERIOD', percentage: 2, month: 9 }, // September
  ];

  it('applies no discount when no criteria are met', () => {
    const discounts = determineApplicableDiscounts(
      rules,
      400,
      4,
      new Date('2026-08-15T00:00:00Z')
    );
    expect(discounts).toEqual([]);
  });

  it('applies lower quantity tier when quantity > 5 but <= 10', () => {
    const discounts = determineApplicableDiscounts(
      rules,
      600,
      6,
      new Date('2026-08-15T00:00:00Z')
    );
    expect(discounts).toEqual([3]);
  });

  it('applies higher quantity tier when quantity > 10, ignoring lower tier', () => {
    const discounts = determineApplicableDiscounts(
      rules,
      1500,
      12,
      new Date('2026-08-15T00:00:00Z')
    );
    // 5% (tier 2 quantity) + 5% (total amount >= 1000)
    expect(discounts).toEqual([5, 5]);
  });

  it('applies month discount in target month (September, UTC)', () => {
    const discounts = determineApplicableDiscounts(
      rules,
      500,
      4,
      new Date('2026-09-10T12:00:00Z')
    );
    expect(discounts).toEqual([2]);
  });

  it('cumulates all satisfied distinct discount criteria', () => {
    // Quantity > 10 (5%), Total >= 1000 (5%), September (2%) -> [5, 5, 2]
    const discounts = determineApplicableDiscounts(
      rules,
      1500,
      15,
      new Date('2026-09-01T00:00:00Z')
    );
    expect(discounts).toEqual([5, 5, 2]);
  });
});
