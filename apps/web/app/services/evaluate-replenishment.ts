import { api } from '~/configs/api';
import type {
  EvaluateReplenishmentPayload,
  ReplenishmentEvaluationResponse,
} from '~/types/replenishment';

/**
 * Evaluates replenishment offers across suppliers for a given article and quantity.
 *
 * @param payload - Request criteria containing article ID, quantity, and date.
 * @returns Promise resolving to the supplier evaluation proposal.
 */
export async function evaluateReplenishment(
  payload: EvaluateReplenishmentPayload
): Promise<ReplenishmentEvaluationResponse> {
  const response = await api.post<ReplenishmentEvaluationResponse>(
    '/replenishment/evaluate',
    payload
  );
  return response.data;
}
