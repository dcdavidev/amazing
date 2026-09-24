import { prisma } from '../lib/prisma.ts';
import type { ArticleDetail } from '../types/article.ts';
import { getOffersByArticleId } from './get-offers-by-article-id.ts';

/**
 * Retrieves a catalog article and its supplier offers by article ID.
 *
 * @param articleId - Target article unique identifier.
 * @returns Promise resolving to the article detail or null if not found.
 */
export async function getArticleById(
  articleId: string
): Promise<ArticleDetail | null> {
  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!article) {
    return null;
  }

  const offers = await getOffersByArticleId(articleId);

  return {
    id: article.id,
    name: article.name,
    offers,
  };
}
