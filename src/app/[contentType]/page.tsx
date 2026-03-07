import { Suspense } from 'react';
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

function ContentListingFallback() {
  return (
    <div className="min-h-screen">
      <section className="py-section-sm bg-gradient-to-b from-muted/50 to-background border-b border-border">
        <div className="max-w-content mx-auto px-gutter lg:px-gutter-lg">
          <div className="h-4 w-48 bg-muted rounded animate-pulse mb-content" />
          <div className="h-10 w-64 bg-muted rounded animate-pulse mb-4" />
          <div className="h-6 w-96 bg-muted rounded animate-pulse" />
        </div>
      </section>
      <section className="py-section-sm">
        <div className="max-w-content mx-auto px-gutter lg:px-gutter-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-content">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-muted rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

async function ContentListingAsync({
  contentType,
  searchParams,
}: {
  contentType: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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
    content: '',
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
        activeSortBy={String(filters.sortBy || sortBy)}
        activeSortOrder={filters.sortOrder || sortOrder}
        allTags={allTags}
        contentType={contentType}
        config={config}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}

export default async function ContentTypePage({ params, searchParams }: PageProps) {
  const { contentType } = await params;

  if (!isValidContentType(contentType)) {
    notFound();
  }

  return (
    <Suspense fallback={<ContentListingFallback />}>
      <ContentListingAsync contentType={contentType} searchParams={searchParams} />
    </Suspense>
  );
}
