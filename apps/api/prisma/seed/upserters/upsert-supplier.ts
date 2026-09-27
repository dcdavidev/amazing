import {
  PrismaClient,
  type Supplier,
} from '../../../src/generated/prisma/client.js';
import { prisma } from '../client.ts';
import type { SeedSupplierInput } from '../types.ts';

/**
 * Checks if the supplier exists and has correct attributes, upserting when necessary.
 *
 * @param input - Supplier attributes to verify or persist.
 * @param client - Optional Prisma client or transaction instance.
 * @returns Promise resolving to the verified or updated supplier.
 */
export async function upsertSupplier(
  input: SeedSupplierInput,
  client: PrismaClient = prisma
): Promise<Supplier> {
  const existing = await client.supplier.findFirst({
    where: {
      name: input.name,
    },
  });

  if (!existing) {
    return client.supplier.create({
      data: {
        name: input.name,
        minDaysToShip: input.minDaysToShip,
      },
    });
  }

  if (existing.minDaysToShip !== input.minDaysToShip) {
    return client.supplier.update({
      where: {
        id: existing.id,
      },
      data: {
        minDaysToShip: input.minDaysToShip,
      },
    });
  }

  return existing;
}
