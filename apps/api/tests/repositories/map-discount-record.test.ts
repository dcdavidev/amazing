import { describe, expect, it } from 'vitest';

import { mapDiscountRecord } from '../../src/repositories/map-discount-record.ts';

describe('mapDiscountRecord', () => {
  it('maps valid MIN_TOTAL_AMOUNT record', () => {
    const result = mapDiscountRecord({
      type: 'MIN_TOTAL_AMOUNT',
      percentage: 5,
      minAmount: 1000,
      minQuantity: null,
      month: null,
    });

    expect(result).toEqual({
      type: 'MIN_TOTAL_AMOUNT',
      percentage: 5,
      minAmount: 1000,
    });
  });

  it('maps valid MIN_QUANTITY record', () => {
    const result = mapDiscountRecord({
      type: 'MIN_QUANTITY',
      percentage: 3,
      minAmount: null,
      minQuantity: 5,
      month: null,
    });

    expect(result).toEqual({
      type: 'MIN_QUANTITY',
      percentage: 3,
      minQuantity: 5,
    });
  });

  it('maps valid MONTH_PERIOD record', () => {
    const result = mapDiscountRecord({
      type: 'MONTH_PERIOD',
      percentage: 2,
      minAmount: null,
      minQuantity: null,
      month: 9,
    });

    expect(result).toEqual({
      type: 'MONTH_PERIOD',
      percentage: 2,
      month: 9,
    });
  });

  it('returns null on invalid type or missing required numeric field', () => {
    expect(
      mapDiscountRecord({
        type: 'UNKNOWN',
        percentage: 5,
        minAmount: null,
        minQuantity: null,
        month: null,
      })
    ).toBeNull();

    expect(
      mapDiscountRecord({
        type: 'MIN_TOTAL_AMOUNT',
        percentage: 5,
        minAmount: null,
        minQuantity: null,
        month: null,
      })
    ).toBeNull();
  });
});
