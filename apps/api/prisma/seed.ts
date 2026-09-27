import '@dotenvx/dotenvx/config';

import { prisma } from './seed/client.ts';
import { seedArticles, seedSuppliers } from './seed/data/index.ts';
import { upsertArticle } from './seed/upserters/upsert-article.ts';
import { upsertDiscountRules } from './seed/upserters/upsert-discount-rules.ts';
import { upsertSupplier } from './seed/upserters/upsert-supplier.ts';
import { upsertSupplierOffer } from './seed/upserters/upsert-supplier-offer.ts';

/**
 * Seeds initial catalog, supplier offers, and discount criteria idempotently.
 *
 * @returns Promise resolved when the database population completes.
 */
async function main(): Promise<void> {
  const seededArticles = [];

  for (const articleInput of seedArticles) {
    const article = await upsertArticle(articleInput);
    seededArticles.push(article);
  }

  const monitor = seededArticles[0];

  if (!monitor) {
    throw new Error('No seed articles configured.');
  }

  for (const supplierConfig of seedSuppliers) {
    const supplier = await upsertSupplier({
      name: supplierConfig.name,
      minDaysToShip: supplierConfig.minDaysToShip,
    });

    const offer = await upsertSupplierOffer({
      supplierId: supplier.id,
      articleId: monitor.id,
      unitPrice: supplierConfig.offer.unitPrice,
      stockQuantity: supplierConfig.offer.stockQuantity,
    });

    await upsertDiscountRules(offer.id, supplierConfig.discountRules);
  }
}

try {
  await main();
} catch (error: unknown) {
  process.stderr.write(`Seeding failed: ${String(error)}\n`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
