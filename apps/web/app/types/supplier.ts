/**
 * Supplier evaluation item in the comparison view.
 */
export interface SupplierEvaluationResult {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly minDaysToShip: number;
  readonly baseAmount: number;
  readonly totalDiscountPercentage: number;
  readonly finalAmount: number;
  readonly isCheapest: boolean;
}

/**
 * Supplier excluded from fulfillment.
 */
export interface ExcludedSupplierResult {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly reason: 'INSUFFICIENT_STOCK';
}
