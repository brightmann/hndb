import { cacheLife, cacheTag } from 'next/cache';
import { getContent } from '@/lib/content';
import { directoryConfig } from '@/config/directory.config';
import { contentConfig } from '@/config/content.config';
import ContentGrid from '@/components/layout/ContentGrid';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  'use cache';
  cacheLife('max');
  cacheTag('content');

  // Fetch all content, then organize by type
  const { items: allContent } = await getContent({ pageSize: 100 });
  const contentTypes = Object.values(contentConfig.types);

  // Group content by type for sections
  const contentByType = contentTypes.reduce(
    (acc, type) => {
      acc[type.slug] = allContent.filter(
        (item) => item.contentType === type.slug
      );
      return acc;
    },
    {} as Record<string, typeof allContent>
  );

  return (
    <div className="min-h-screen">
      {/* Compact Hero */}
      <section className="py-content-lg bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-content mx-auto px-gutter lg:px-gutter-lg">
          <p className="text-body-lg text-muted-foreground max-w-reading mx-auto text-center animate-fade-in">
            {directoryConfig.description}
          </p>
        </div>
      </section>

      {/* Content Type Sections */}
      {contentTypes.map((type) => {
        const items = contentByType[type.slug] || [];
        if (items.length === 0) return null;

        const displayItems = items.slice(0, 3);

        return (
          <section
            key={type.slug}
            className="py-section-sm border-t border-border"
          >
            <div className="max-w-content mx-auto px-gutter lg:px-gutter-lg">
              {/* Section Header */}
              <div className="flex items-end justify-between mb-content">
                <div>
                  <span className="text-overline uppercase text-primary tracking-wider block mb-1">
                    {type.namePlural}
                  </span>
                  <h2 className="font-heading text-headline text-foreground">
                    Latest {type.namePlural}
                  </h2>
                </div>
                <Link
                  href={`/${type.slug}`}
                  className="group inline-flex items-center gap-2 text-caption font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  View all
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Content Grid */}
              <ContentGrid
                items={displayItems}
                contentType={type.slug}
                layout="default"
                showTags
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
