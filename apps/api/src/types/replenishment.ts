import type { ExcludedSupplier, SupplierEvaluation } from './supplier.ts';

/**
 * Parameters required to compute a replenishment comparison.
 */
export interface PurchaseOrderRequest {
  readonly articleId: string;
  readonly quantity: number;
  readonly orderDate: Date;
}

/**
 * Full output payload returned by the replenishment calculation engine.
 */
export interface ReplenishmentProposal {
  readonly requestedArticleId: string;
  readonly requestedQuantity: number;
  readonly orderDate: Date;
  readonly eligibleSuppliers: readonly SupplierEvaluation[];
  readonly excludedSuppliers: readonly ExcludedSupplier[];
}

/**
 * Request body payload for the evaluate replenishment endpoint.
 */
export interface EvaluateReplenishmentBody {
  readonly articleId?: unknown;
  readonly quantity?: unknown;
  readonly orderDate?: unknown;
}
