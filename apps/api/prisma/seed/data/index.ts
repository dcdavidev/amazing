import { seedArticles } from './articles.ts';
import { seedSuppliers } from './suppliers.ts';

export { seedArticles } from './articles.ts';
export { seedSuppliers } from './suppliers.ts';

/**
 * Aggregated baseline seed dataset for database population.
 */
export const SEED_DATA = {
  articles: seedArticles,
  suppliers: seedSuppliers,
} as const;
