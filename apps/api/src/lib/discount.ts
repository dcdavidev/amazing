import type {
  DiscountRule,
  MinQuantityDiscountRule,
  MinTotalAmountDiscountRule,
  MonthPeriodDiscountRule,
} from '../types/discount.ts';

/**
 * Selects all applicable discount percentages for an offer based on order criteria.
 *
 * @param rules - Configured discount rules for the supplier offer.
 * @param baseAmount - Pre-discount total amount for the order.
 * @param quantity - Number of items ordered.
 * @param orderDate - The date when the order is placed.
 * @returns An array of applied percentage discounts.
 */
export function determineApplicableDiscounts(
  rules: readonly DiscountRule[],
  baseAmount: number,
  quantity: number,
  orderDate: Date
): number[] {
  const applicablePercentages: number[] = [];

  // Handle tiered quantity discounts (take only the highest tier met)
  const quantityRules = rules
    .filter(
      (rule): rule is MinQuantityDiscountRule => rule.type === 'MIN_QUANTITY'
    )
    .filter((rule) => quantity > rule.minQuantity)
    .toSorted((a, b) => b.percentage - a.percentage);

  const highestTierRule = quantityRules[0];
  if (highestTierRule !== undefined) {
    // Apply only the highest qualified discount tier
    applicablePercentages.push(highestTierRule.percentage);
  }

  // Handle minimum total amount discount
  const amountRules = rules.filter(
    (rule): rule is MinTotalAmountDiscountRule =>
      rule.type === 'MIN_TOTAL_AMOUNT'
  );

  for (const rule of amountRules) {
    if (baseAmount >= rule.minAmount) {
      applicablePercentages.push(rule.percentage);
    }
  }

  // Handle month-specific discount (JavaScript getUTCMonth is 0-indexed, domain is 1-indexed)
  const orderMonth = orderDate.getUTCMonth() + 1;
  const monthRules = rules.filter(
    (rule): rule is MonthPeriodDiscountRule => rule.type === 'MONTH_PERIOD'
  );

  for (const rule of monthRules) {
    if (rule.month === orderMonth) {
      applicablePercentages.push(rule.percentage);
    }
  }

  return applicablePercentages;
}
