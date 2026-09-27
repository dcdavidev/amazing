import {
  PrismaClient,
  type SupplierOffer,
} from '../../../src/models/prisma/client.js';
import { prisma } from '../client.ts';
import type { SeedSupplierOfferInput } from '../types.ts';

/**
 * Checks if the supplier offer exists and matches expected pricing and inventory, upserting when necessary.
 *
 * @param input - Offer attributes to verify or persist.
 * @param client - Optional Prisma client or transaction instance.
 * @returns Promise resolving to the verified or updated supplier offer.
 */
export async function upsertSupplierOffer(
  input: SeedSupplierOfferInput,
  client: PrismaClient = prisma
): Promise<SupplierOffer> {
  const existing = await client.supplierOffer.findUnique({
    where: {
      supplierId_articleId: {
        supplierId: input.supplierId,
        articleId: input.articleId,
      },
    },
  });

  if (!existing) {
    return client.supplierOffer.create({
      data: {
        supplierId: input.supplierId,
        articleId: input.articleId,
        unitPrice: input.unitPrice,
        stockQuantity: input.stockQuantity,
      },
    });
  }

  if (
    existing.unitPrice !== input.unitPrice ||
    existing.stockQuantity !== input.stockQuantity
  ) {
    return client.supplierOffer.update({
      where: {
        id: existing.id,
      },
      data: {
        unitPrice: input.unitPrice,
        stockQuantity: input.stockQuantity,
      },
    });
  }

  return existing;
}
