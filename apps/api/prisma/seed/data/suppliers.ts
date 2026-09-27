import type { SeedSupplierConfig } from '../types.ts';

/**
 * Baseline supplier configurations including offers and discount rules.
 */
export const seedSuppliers: readonly SeedSupplierConfig[] = [
  {
    name: 'Supplier 1',
    minDaysToShip: 5,
    offer: {
      unitPrice: 120,
      stockQuantity: 8,
    },
    discountRules: [
      {
        type: 'MIN_TOTAL_AMOUNT',
        percentage: 5,
        minAmount: 1000,
      },
    ],
  },
  {
    name: 'Supplier 2',
    minDaysToShip: 7,
    offer: {
      unitPrice: 128,
      stockQuantity: 15,
    },
    discountRules: [
      {
        type: 'MIN_QUANTITY',
        percentage: 3,
        minQuantity: 5,
      },
      {
        type: 'MIN_QUANTITY',
        percentage: 5,
        minQuantity: 10,
      },
    ],
  },
  {
    name: 'Supplier 3',
    minDaysToShip: 4,
    offer: {
      unitPrice: 129,
      stockQuantity: 23,
    },
    discountRules: [
      {
        type: 'MIN_TOTAL_AMOUNT',
        percentage: 5,
        minAmount: 1000,
      },
      {
        type: 'MONTH_PERIOD',
        percentage: 2,
        month: 9, // September
      },
    ],
  },
];
