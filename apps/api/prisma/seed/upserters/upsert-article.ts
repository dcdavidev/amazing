import {
  type Article,
  PrismaClient,
} from '../../../src/models/prisma/client.js';
import { prisma } from '../client.ts';
import type { SeedArticleInput } from '../types.ts';

/**
 * Upserts the base catalog article if it does not already exist.
 *
 * @param input - Article creation attributes.
 * @param client - Optional Prisma client or transaction instance.
 * @returns Promise resolving to the retrieved or created article.
 */
export async function upsertArticle(
  input: SeedArticleInput,
  client: PrismaClient = prisma
): Promise<Article> {
  const existing = await client.article.findFirst({
    where: {
      name: input.name,
    },
  });

  if (existing) {
    return existing;
  }

  return client.article.create({
    data: {
      name: input.name,
    },
  });
}
