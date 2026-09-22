import {
  DiscountRule,
  MinQuantityDiscountRule,
  MinTotalAmountDiscountRule,
  MonthPeriodDiscountRule,
  PurchaseOrderRequest,
  ReplenishmentProposal,
  SupplierArticleOffer,
  SupplierEvaluation,
} from '../types/calculator.js';

/**
 * Rounds a floating-point number to two decimal places.
 *
 * @param value - The raw monetary number.
 * @returns The rounded number with two decimals.
 */
function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Selects all applicable discount percentages for an offer based on order criteria.
 *
 * @param rules - Configured discount rules for the supplier offer.
 * @param baseAmount - Pre-discount total amount for the order.
 * @param quantity - Number of items ordered.
 * @param orderDate - The date when the order is placed.
 * @returns An array of applied percentage discounts.
 */
function determineApplicableDiscounts(
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

/**
 * Computes replenishment evaluations and highlights the cheapest eligible supplier.
 *
 * @param request - Order requirements including article, quantity, and date.
 * @param offers - All supplier catalog offers available for the requested article.
 * @returns Comparison breakdown including eligible and excluded suppliers.
 */
export function calculateReplenishment(
  request: PurchaseOrderRequest,
  offers: readonly SupplierArticleOffer[]
): ReplenishmentProposal {
  const eligibleSuppliers: SupplierEvaluation[] = [];
  const excludedSuppliers: ReplenishmentProposal['excludedSuppliers'][number][] =
    [];

  for (const offer of offers) {
    // Exclude supplier if available inventory is below requested volume
    if (offer.stockQuantity < request.quantity) {
      excludedSuppliers.push({
        supplierId: offer.supplierId,
        supplierName: offer.supplierName,
        reason: 'INSUFFICIENT_STOCK',
      });
      continue;
    }

    const baseAmount = offer.unitPrice * request.quantity;
    const applicableDiscounts = determineApplicableDiscounts(
      offer.discountRules,
      baseAmount,
      request.quantity,
      request.orderDate
    );

    // Compound all active discounts sequentially
    let discountedAmount = baseAmount;
    for (const discount of applicableDiscounts) {
      discountedAmount *= 1 - discount / 100;
    }

    const finalAmount = roundToTwoDecimals(discountedAmount);
    const effectiveDiscountPercentage = roundToTwoDecimals(
      ((baseAmount - finalAmount) / baseAmount) * 100
    );

    eligibleSuppliers.push({
      supplierId: offer.supplierId,
      supplierName: offer.supplierName,
      minDaysToShip: offer.minDaysToShip,
      baseAmount: roundToTwoDecimals(baseAmount),
      totalDiscountPercentage: effectiveDiscountPercentage,
      finalAmount,
      isCheapest: false,
    });
  }

  // Identify the lowest price among eligible suppliers
  if (eligibleSuppliers.length > 0) {
    let minPrice = Infinity;

    for (const candidate of eligibleSuppliers) {
      if (candidate.finalAmount < minPrice) {
        minPrice = candidate.finalAmount;
      }
    }

    for (let index = 0; index < eligibleSuppliers.length; index++) {
      const supplier = eligibleSuppliers[index];
      if (supplier !== undefined && supplier.finalAmount === minPrice) {
        eligibleSuppliers[index] = {
          ...supplier,
          isCheapest: true,
        };
      }
    }
  }

  return {
    requestedArticleId: request.articleId,
    requestedQuantity: request.quantity,
    orderDate: request.orderDate,
    eligibleSuppliers,
    excludedSuppliers,
  };
}
