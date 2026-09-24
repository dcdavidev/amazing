import type {
  PurchaseOrderRequest,
  ReplenishmentProposal,
} from '../types/replenishment.ts';
import type {
  SupplierArticleOffer,
  SupplierEvaluation,
} from '../types/supplier.ts';
import { determineApplicableDiscounts } from './discount.ts';
import { roundToTwoDecimals } from './round.ts';

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
