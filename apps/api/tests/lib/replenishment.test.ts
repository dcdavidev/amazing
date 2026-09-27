import { describe, expect, it } from 'vitest';

import { calculateReplenishment } from '../../src/lib/replenishment.ts';
import type { SupplierArticleOffer } from '../../src/types/supplier.ts';

describe('calculateReplenishment', () => {
  const sampleOffers: SupplierArticleOffer[] = [
    {
      supplierId: 's1',
      supplierName: 'Supplier 1',
      minDaysToShip: 5,
      unitPrice: 120,
      stockQuantity: 8,
      discountRules: [
        { type: 'MIN_TOTAL_AMOUNT', percentage: 5, minAmount: 1000 },
      ],
    },
    {
      supplierId: 's2',
      supplierName: 'Supplier 2',
      minDaysToShip: 7,
      unitPrice: 128,
      stockQuantity: 15,
      discountRules: [
        { type: 'MIN_QUANTITY', percentage: 3, minQuantity: 5 },
        { type: 'MIN_QUANTITY', percentage: 5, minQuantity: 10 },
      ],
    },
    {
      supplierId: 's3',
      supplierName: 'Supplier 3',
      minDaysToShip: 4,
      unitPrice: 129,
      stockQuantity: 23,
      discountRules: [
        { type: 'MIN_TOTAL_AMOUNT', percentage: 5, minAmount: 1000 },
        { type: 'MONTH_PERIOD', percentage: 2, month: 9 },
      ],
    },
  ];

  it('excludes suppliers with insufficient stock', () => {
    const proposal = calculateReplenishment(
      {
        articleId: 'art-1',
        quantity: 10,
        orderDate: new Date('2026-09-10T00:00:00Z'),
      },
      sampleOffers
    );

    expect(proposal.excludedSuppliers).toEqual([
      {
        supplierId: 's1',
        supplierName: 'Supplier 1',
        reason: 'INSUFFICIENT_STOCK',
      },
    ]);
    expect(proposal.eligibleSuppliers).toHaveLength(2);
  });

  it('correctly calculates discounts and marks cheapest supplier for 5 units in September', () => {
    const proposal = calculateReplenishment(
      {
        articleId: 'art-1',
        quantity: 5,
        orderDate: new Date('2026-09-10T00:00:00Z'),
      },
      sampleOffers
    );

    expect(proposal.excludedSuppliers).toHaveLength(0);
    expect(proposal.eligibleSuppliers).toHaveLength(3);

    // Supplier 1: 5 * 120 = 600, no discount -> 600
    const s1 = proposal.eligibleSuppliers.find((s) => s.supplierId === 's1');
    expect(s1?.finalAmount).toBe(600);
    expect(s1?.isCheapest).toBe(true);

    // Supplier 2: 5 * 128 = 640, no discount (minQuantity > 5) -> 640
    const s2 = proposal.eligibleSuppliers.find((s) => s.supplierId === 's2');
    expect(s2?.finalAmount).toBe(640);
    expect(s2?.isCheapest).toBe(false);

    // Supplier 3: 5 * 129 = 645, 2% September -> 632.10
    const s3 = proposal.eligibleSuppliers.find((s) => s.supplierId === 's3');
    expect(s3?.finalAmount).toBe(632.1);
    expect(s3?.isCheapest).toBe(false);
  });

  it('marks multiple suppliers as isCheapest in case of a tie', () => {
    const tiedOffers: SupplierArticleOffer[] = [
      {
        supplierId: 'a',
        supplierName: 'A',
        minDaysToShip: 3,
        unitPrice: 100,
        stockQuantity: 10,
        discountRules: [],
      },
      {
        supplierId: 'b',
        supplierName: 'B',
        minDaysToShip: 2,
        unitPrice: 100,
        stockQuantity: 10,
        discountRules: [],
      },
    ];

    const proposal = calculateReplenishment(
      {
        articleId: 'art-1',
        quantity: 5,
        orderDate: new Date('2026-09-10T00:00:00Z'),
      },
      tiedOffers
    );

    expect(proposal.eligibleSuppliers[0]?.isCheapest).toBe(true);
    expect(proposal.eligibleSuppliers[1]?.isCheapest).toBe(true);
  });
});
