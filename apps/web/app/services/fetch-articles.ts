import { api } from '~/configs/api';
import type { ArticleOption } from '~/types/article';

/**
 * Fetches the list of all available articles.
 *
 * @returns Promise resolving to an array of articles.
 */
export async function fetchArticles(): Promise<ArticleOption[]> {
  const response = await api.get<ArticleOption[]>('/articles');
  return response.data;
}
