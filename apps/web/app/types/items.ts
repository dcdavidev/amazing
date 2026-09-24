/**
 * Article catalog item returned from backend.
 */
export interface ArticleOption {
  readonly id: string;
  readonly name: string;
}

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

/**
 * Complete evaluation response from the backend endpoint.
 */
export interface ReplenishmentEvaluationResponse {
  readonly requestedArticleId: string;
  readonly requestedQuantity: number;
  readonly orderDate: string;
  readonly eligibleSuppliers: readonly SupplierEvaluationResult[];
  readonly excludedSuppliers: readonly ExcludedSupplierResult[];
}
