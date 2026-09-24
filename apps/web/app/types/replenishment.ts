import type {
  ExcludedSupplierResult,
  SupplierEvaluationResult,
} from './supplier';

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

/**
 * Replenishment evaluation request payload.
 */
export interface EvaluateReplenishmentPayload {
  readonly articleId: string;
  readonly quantity: number;
  readonly orderDate: string;
}
