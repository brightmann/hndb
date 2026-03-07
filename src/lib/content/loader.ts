import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { contentConfig } from '@/config/content.config';
import type {
  ContentItem,
  ContentQuery,
  PaginatedContent,
  BaseContentMeta,
} from './types';

/**
 * Load all content for a specific type
 */
function loadContentType(contentType: string): ContentItem[] {
  const typeConfig = contentConfig.types[contentType];
  if (!typeConfig) {
    console.warn(`Unknown content type: ${contentType}`);
    return [];
  }

  const contentDir = path.join(
    process.cwd(),
    contentConfig.contentRoot,
    typeConfig.directory
  );

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx'));

  const items = files.map((fileName) => {
    const slug = fileName.replace('.mdx', '');
    const fullPath = path.join(contentDir, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      contentType,
      content,
      meta: {
        ...data,
        slug,
        contentType,
      } as BaseContentMeta,
    };
  });

  return items;
}

/**
 * Load all content across all types
 */
function loadAllContent(): ContentItem[] {
  return Object.keys(contentConfig.types).flatMap(loadContentType);
}

/**
 * Main query function - handles filtering, sorting, pagination
 */
export async function getContent(
  query: ContentQuery = {}
): Promise<PaginatedContent> {
  'use cache';
  cacheLife('max');
  cacheTag('content');

  const {
    contentType,
    page = 1,
    pageSize = contentConfig.defaults.pageSize,
    query: searchQuery,
    tags,
    sortBy = contentConfig.defaults.sortField as keyof BaseContentMeta,
    sortOrder = contentConfig.defaults.sortOrder,
  } = query;

  // Load content
  let items = contentType ? loadContentType(contentType) : loadAllContent();

  // Filter by search query
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter((item) => {
      const searchable = [
        item.meta.title,
        item.meta.summary,
        item.meta.tags?.join(' '),
        item.meta.author,
        item.meta.topic,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(q);
    });
  }

  // Filter by tags (AND logic)
  if (tags && tags.length > 0) {
    items = items.filter((item) =>
      tags.every((tag) => item.meta.tags?.includes(tag))
    );
  }

  // Sort
  items = [...items].sort((a, b) => {
    const aVal = a.meta[sortBy];
    const bVal = b.meta[sortBy];

    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    const comparison = String(aVal).localeCompare(String(bVal));
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Paginate
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    filters: {
      query: searchQuery,
      tags,
      sortBy: sortBy as string,
      sortOrder,
    },
  };
}

/**
 * Get a single content item by type and slug
 * Wrapped with React cache() so generateMetadata and page component share a single call per render pass
 */
export const getContentBySlug = cache(async function getContentBySlug(
  contentType: string,
  slug: string
): Promise<ContentItem | null> {
  'use cache';
  cacheLife('max');
  cacheTag('content');

  const items = loadContentType(contentType);
  return items.find((item) => item.slug === slug) || null;
});

/**
 * Get all content for a specific type (no pagination)
 */
export async function getAllContentByType(
  contentType: string
): Promise<ContentItem[]> {
  'use cache';
  cacheLife('max');
  cacheTag('content');

  return loadContentType(contentType);
}

/**
 * Get all tags for a content type with counts
 */
export async function getTagsForType(
  contentType?: string
): Promise<Record<string, number>> {
  'use cache';
  cacheLife('max');
  cacheTag('content');

  const items = contentType ? loadContentType(contentType) : loadAllContent();

  const tagCounts: Record<string, number> = {};

  items.forEach((item) => {
    item.meta.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return tagCounts;
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
  'use cache';
  cacheLife('max');
  cacheTag('content');

  const tagCounts = await getTagsForType();
  return Object.keys(tagCounts).sort();
}

/**
 * Get content by tag (across all types)
 */
export async function getContentByTag(tag: string): Promise<ContentItem[]> {
  'use cache';
  cacheLife('max');
  cacheTag('content');

  const items = loadAllContent();
  return items.filter((item) => item.meta.tags?.includes(tag));
}

/**
 * Generate static params for all content
 */
export async function getAllContentSlugs(): Promise<
  Array<{ contentType: string; slug: string }>
> {
  'use cache';
  cacheLife('max');
  cacheTag('content');

  return loadAllContent().map((item) => ({
    contentType: item.contentType,
    slug: item.slug,
  }));
}

/**
 * Get all content types
 */
export function getContentTypes(): string[] {
  return Object.keys(contentConfig.types);
}

/**
 * Check if a content type exists
 */
export function isValidContentType(contentType: string): boolean {
  return contentType in contentConfig.types;
}

/**
 * Get all content for search (without the large MDX content field)
 */
export async function getAllContentForSearch(): Promise<
  Array<Omit<ContentItem, 'content'>>
> {
  'use cache';
  cacheLife('max');
  cacheTag('content');

  const items = loadAllContent();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return items.map(({ content, ...rest }) => rest);
}
