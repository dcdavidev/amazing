import { api } from '~/configs/api';
import type { ArticleDetail } from '~/types/article';

/**
 * Fetches an article by its unique identifier including its purchasing supplier offers.
 *
 * @param id - Target article unique identifier.
 * @returns Promise resolving to the detailed article data.
 */
export async function fetchArticleById(id: string): Promise<ArticleDetail> {
  const response = await api.get<ArticleDetail>(`/articles/${id}`);
  return response.data;
}
