import type { DiscountRule } from '../../../src/models/prisma/client.js';
import type { SeedDiscountRule } from '../types.ts';

/**
 * Determines whether an existing discount rule record matches the expected rule values exactly.
 *
 * @param existing - Existing discount rule record from database.
 * @param expected - Expected discount rule configuration.
 * @returns True if all fields match, false otherwise.
 */
export function isDiscountRuleMatch(
  existing: DiscountRule,
  expected: SeedDiscountRule
): boolean {
  return (
    existing.type === expected.type &&
    existing.percentage === expected.percentage &&
    (existing.minAmount ?? undefined) === expected.minAmount &&
    (existing.minQuantity ?? undefined) === expected.minQuantity &&
    (existing.month ?? undefined) === expected.month
  );
}
