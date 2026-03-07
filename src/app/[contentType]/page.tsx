import { notFound } from 'next/navigation';
import { contentConfig } from '@/config/content.config';
import { seoConfig } from '@/config/directory.config';
import {
  getContent,
  getTagsForType,
  getContentTypes,
  isValidContentType,
} from '@/lib/content';
import type { BaseContentMeta } from '@/lib/content';
import { generatePageMetadata } from '@/lib/metadata';
import { JsonLd, generateCollectionPageSchema } from '@/lib/structured-data';
import { generateContentBreadcrumbs } from '@/components/Breadcrumbs';
import ContentListingClient from './ContentListingClient';

interface PageProps {
  params: Promise<{ contentType: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  return getContentTypes().map((type) => ({
    contentType: type,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { contentType } = await params;
  const config = contentConfig.types[contentType];

  if (!config) {
    return { title: 'Not Found' };
  }

  return generatePageMetadata({
    title: config.namePlural,
    description: `Browse all ${config.namePlural.toLowerCase()}`,
    canonical: `${seoConfig.siteUrl}/${contentType}`,
  });
}

export default async function ContentTypePage({ params, searchParams }: PageProps) {
  const { contentType } = await params;

  if (!isValidContentType(contentType)) {
    notFound();
  }

  const config = contentConfig.types[contentType];
  const resolvedSearchParams = await searchParams;

  // Parse query params from URL
  const page = Number(resolvedSearchParams.page) || 1;
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
  const tagsParam = resolvedSearchParams.tags;
  const tags = tagsParam
    ? Array.isArray(tagsParam)
      ? tagsParam
      : tagsParam.split(',').filter(Boolean)
    : undefined;
  const sortParts = typeof resolvedSearchParams.sort === 'string'
    ? resolvedSearchParams.sort.split(':')
    : undefined;
  const sortBy = (sortParts?.[0] || config.defaultSort?.field || contentConfig.defaults.sortField) as keyof BaseContentMeta;
  const sortOrder = (sortParts?.[1] as 'asc' | 'desc') || config.defaultSort?.order || contentConfig.defaults.sortOrder;
  const pageSize = config.pageSize || contentConfig.defaults.pageSize;

  // Server-side filtering, sorting, and pagination
  const [{ items, pagination, filters }, allTags] = await Promise.all([
    getContent({
      contentType,
      page,
      pageSize,
      query,
      tags,
      sortBy,
      sortOrder,
    }),
    getTagsForType(contentType),
  ]);

  const breadcrumbs = generateContentBreadcrumbs(config);

  // Serialize items - strip content field to reduce payload, ensure no Date objects
  const serializedItems = items.map((item) => ({
    slug: item.slug,
    contentType: item.contentType,
    content: '', // Don't send MDX content to client
    meta: {
      ...item.meta,
      date: item.meta.date ? String(item.meta.date) : undefined,
    },
  }));

  const description = `Browse all ${config.namePlural.toLowerCase()}`;
  const url = `${seoConfig.siteUrl}/${contentType}`;

  return (
    <>
      <JsonLd data={generateCollectionPageSchema(config.namePlural, description, url, pagination.totalItems)} />
      <ContentListingClient
        items={serializedItems}
        pagination={pagination}
        activeTags={filters.tags || []}
        activeQuery={filters.query || ''}
        activeSortBy={filters.sortBy || sortBy}
        activeSortOrder={filters.sortOrder || sortOrder}
        allTags={allTags}
        contentType={contentType}
        config={config}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
