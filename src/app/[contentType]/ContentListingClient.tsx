'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import ContentGrid from '@/components/layout/ContentGrid';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ContentItem } from '@/lib/content/types';
import type { ContentTypeConfig } from '@/lib/content/types';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ContentListingClientProps {
  items: ContentItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  activeTags: string[];
  activeQuery: string;
  activeSortBy: string;
  activeSortOrder: 'asc' | 'desc';
  allTags: Record<string, number>;
  contentType: string;
  config: ContentTypeConfig;
  breadcrumbs: BreadcrumbItem[];
}

export default function ContentListingClient({
  items,
  pagination,
  activeTags,
  activeQuery,
  activeSortBy,
  activeSortOrder,
  allTags,
  contentType,
  config,
  breadcrumbs,
}: ContentListingClientProps) {
  const router = useRouter();

  // Build URL helper
  const buildUrl = useCallback(
    (overrides: { page?: number; tags?: string[]; q?: string; sort?: string }) => {
      const params = new URLSearchParams();
      const newPage = overrides.page ?? pagination.page;
      const newTags = overrides.tags ?? activeTags;
      const newQuery = overrides.q !== undefined ? overrides.q : activeQuery;
      const newSort =
        overrides.sort ?? `${activeSortBy}:${activeSortOrder}`;

      if (newPage > 1) params.set('page', String(newPage));
      if (newTags.length > 0) params.set('tags', newTags.join(','));
      if (newQuery) params.set('q', newQuery);
      if (newSort) params.set('sort', newSort);

      const qs = params.toString();
      return `/${contentType}${qs ? `?${qs}` : ''}`;
    },
    [pagination.page, activeTags, activeQuery, activeSortBy, activeSortOrder, contentType]
  );

  const navigate = useCallback(
    (url: string) => {
      router.push(url, { scroll: false });
    },
    [router]
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      const isActive = activeTags.includes(tag);
      const newTags = isActive ? activeTags.filter((t) => t !== tag) : [...activeTags, tag];
      navigate(buildUrl({ tags: newTags, page: 1 }));
    },
    [activeTags, navigate, buildUrl]
  );

  const handleClearTags = useCallback(() => {
    navigate(buildUrl({ tags: [], page: 1 }));
  }, [navigate, buildUrl]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      navigate(buildUrl({ page: newPage }));
    },
    [navigate, buildUrl]
  );

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="py-section-sm bg-gradient-to-b from-muted/50 to-background border-b border-border">
        <div className="max-w-content mx-auto px-gutter lg:px-gutter-lg">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} className="mb-content" />

          {/* Title */}
          <h1 className="font-heading text-display tracking-tight text-foreground mb-4 animate-fade-in">
            {config.namePlural}
          </h1>

          <p
            className="text-body-lg text-muted-foreground max-w-reading animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            Explore our collection of {config.namePlural.toLowerCase()}.
          </p>

          {/* Result count */}
          <p
            className="text-caption text-muted-foreground mt-4 animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            {pagination.totalItems} {pagination.totalItems === 1 ? 'item' : 'items'} found
            {activeTags.length > 0 &&
              ` in ${activeTags.length} selected ${activeTags.length === 1 ? 'tag' : 'tags'}`}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-section-sm">
        <div className="max-w-content mx-auto px-gutter lg:px-gutter-lg">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-content-lg">
            {/* Main Content */}
            <main
              className={
                Object.keys(allTags).length > 0 ? 'lg:col-span-3 lg:order-1' : 'lg:col-span-4'
              }
            >
              {items.length > 0 ? (
                <ContentGrid
                  items={items}
                  contentType={contentType}
                  layout={pagination.page === 1 ? 'magazine' : 'default'}
                  showTags
                />
              ) : (
                <div className="text-center py-section">
                  <p className="text-body-lg text-muted-foreground mb-4">
                    No {config.namePlural.toLowerCase()} found
                    {activeTags.length > 0 && ' with the selected tags'}.
                  </p>
                  {activeTags.length > 0 && (
                    <Button variant="outline" onClick={handleClearTags}>
                      Clear filters
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="flex items-center justify-center gap-2 mt-section-sm pt-content border-t border-border"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        return (
                          p === 1 ||
                          p === pagination.totalPages ||
                          Math.abs(p - pagination.page) <= 1
                        );
                      })
                      .map((p, idx, arr) => {
                        const showEllipsisBefore = idx > 0 && arr[idx - 1] !== p - 1;
                        return (
                          <span key={p} className="flex items-center gap-1">
                            {showEllipsisBefore && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={p === pagination.page ? 'default' : 'ghost'}
                              size="sm"
                              className="w-9 h-9"
                              onClick={() => handlePageChange(p)}
                            >
                              {p}
                            </Button>
                          </span>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </nav>
              )}
            </main>

            {/* Sidebar - Tags */}
            {Object.keys(allTags).length > 0 && (
              <aside className="lg:col-span-1 lg:order-2">
                <div className="sticky top-24 p-6 bg-card rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-title-sm font-semibold text-foreground">
                      Filter by Tag
                    </h2>
                    {activeTags.length > 0 && (
                      <button
                        onClick={handleClearTags}
                        className="text-micro text-primary hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Active tags */}
                  {activeTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border">
                      {activeTags.map((tag) => (
                        <button key={tag} onClick={() => handleTagToggle(tag)}>
                          <Badge
                            variant="default"
                            className="cursor-pointer group gap-1 pr-1"
                          >
                            {tag}
                            <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* All tags */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(allTags).map(([tag, count]) => {
                      const isActive = activeTags.includes(tag);
                      if (isActive) return null;

                      return (
                        <button key={tag} onClick={() => handleTagToggle(tag)}>
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-muted hover:border-primary/50 transition-colors duration-200"
                          >
                            {tag}
                            <span className="ml-1 text-muted-foreground">({count})</span>
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
