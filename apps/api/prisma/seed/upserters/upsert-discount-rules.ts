import { PrismaClient } from '../../../src/generated/prisma/client.js';
import { prisma } from '../client.ts';
import type { SeedDiscountRule } from '../types.ts';
import { isDiscountRuleMatch } from './is-discount-rule-match.ts';

/**
 * Checks if discount rules are present and correct for an offer, upserting any missing or outdated rules.
 *
 * @param offerId - Target supplier offer identifier.
 * @param expectedRules - List of expected discount rule configurations.
 * @param client - Optional Prisma client or transaction instance.
 * @returns Promise resolving when all rules are verified or upserted.
 */
export async function upsertDiscountRules(
  offerId: string,
  expectedRules: readonly SeedDiscountRule[],
  client: PrismaClient = prisma
): Promise<void> {
  const existingRules = await client.discountRule.findMany({
    where: {
      offerId,
    },
  });

  const claimedRuleIds = new Set<string>();

  for (const expected of expectedRules) {
    // 1. Check if an exact match already exists
    const exactMatch = existingRules.find(
      (candidate) =>
        !claimedRuleIds.has(candidate.id) &&
        isDiscountRuleMatch(candidate, expected)
    );

    if (exactMatch) {
      claimedRuleIds.add(exactMatch.id);
      continue;
    }

    // 2. Look for a candidate rule to update
    const candidateMatch =
      existingRules.find((candidate) => {
        if (
          claimedRuleIds.has(candidate.id) ||
          candidate.type !== expected.type
        ) {
          return false;
        }

        if (expected.type === 'MIN_QUANTITY') {
          return candidate.minQuantity === (expected.minQuantity ?? null);
        }

        return expected.type === 'MIN_TOTAL_AMOUNT'
          ? candidate.minAmount === (expected.minAmount ?? null)
          : expected.type === 'MONTH_PERIOD' &&
              candidate.month === (expected.month ?? null);
      }) ??
      existingRules.find(
        (candidate) =>
          !claimedRuleIds.has(candidate.id) && candidate.type === expected.type
      );

    if (candidateMatch) {
      claimedRuleIds.add(candidateMatch.id);
      await client.discountRule.update({
        where: {
          id: candidateMatch.id,
        },
        data: {
          type: expected.type,
          percentage: expected.percentage,
          minAmount: expected.minAmount ?? null,
          minQuantity: expected.minQuantity ?? null,
          month: expected.month ?? null,
        },
      });
    } else {
      const created = await client.discountRule.create({
        data: {
          offerId,
          type: expected.type,
          percentage: expected.percentage,
          minAmount: expected.minAmount ?? null,
          minQuantity: expected.minQuantity ?? null,
          month: expected.month ?? null,
        },
      });
      claimedRuleIds.add(created.id);
    }
  }
}
