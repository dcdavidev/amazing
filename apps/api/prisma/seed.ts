import { prisma } from '../src/lib/prisma.js';

/**
 * Seeds initial catalog, supplier offers, and discount criteria.
 *
 * @returns Promise resolved when the database population completes.
 */
async function main(): Promise<void> {
  // Clear existing entries to prevent duplication
  await prisma.discountRule.deleteMany();
  await prisma.supplierOffer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.article.deleteMany();

  // 1. Create the base article
  const monitor = await prisma.article.create({
    data: {
      name: 'Philips monitor 17"',
    },
  });

  // 2. Create Supplier 1
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Supplier 1',
      minDaysToShip: 5,
    },
  });

  const offer1 = await prisma.supplierOffer.create({
    data: {
      supplierId: supplier1.id,
      articleId: monitor.id,
      unitPrice: 120,
      stockQuantity: 8,
    },
  });

  await prisma.discountRule.create({
    data: {
      offerId: offer1.id,
      type: 'MIN_TOTAL_AMOUNT',
      percentage: 5,
      minAmount: 1000,
    },
  });

  // 3. Create Supplier 2
  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Supplier 2',
      minDaysToShip: 7,
    },
  });

  const offer2 = await prisma.supplierOffer.create({
    data: {
      supplierId: supplier2.id,
      articleId: monitor.id,
      unitPrice: 128,
      stockQuantity: 15,
    },
  });

  await prisma.discountRule.createMany({
    data: [
      {
        offerId: offer2.id,
        type: 'MIN_QUANTITY',
        percentage: 3,
        minQuantity: 5,
      },
      {
        offerId: offer2.id,
        type: 'MIN_QUANTITY',
        percentage: 5,
        minQuantity: 10,
      },
    ],
  });

  // 4. Create Supplier 3
  const supplier3 = await prisma.supplier.create({
    data: {
      name: 'Supplier 3',
      minDaysToShip: 4,
    },
  });

  const offer3 = await prisma.supplierOffer.create({
    data: {
      supplierId: supplier3.id,
      articleId: monitor.id,
      unitPrice: 129,
      stockQuantity: 23,
    },
  });

  await prisma.discountRule.createMany({
    data: [
      {
        offerId: offer3.id,
        type: 'MIN_TOTAL_AMOUNT',
        percentage: 5,
        minAmount: 1000,
      },
      {
        offerId: offer3.id,
        type: 'MONTH_PERIOD',
        percentage: 2,
        month: 9, // September
      },
    ],
  });
}

try {
  await main();
} catch (error: unknown) {
  process.stderr.write(`Seeding failed: ${String(error)}\n`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
