# Fix SEO Regression & Code Review Issues Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore server-side rendering for content listing pages while keeping client-side interactivity, fix the `tags` array memoization bug, and update CLAUDE.md to reflect the Next.js 16 upgrade.

**Architecture:** Hybrid approach — the server component renders the initial page using `searchParams` (so crawlers and direct URL access get fully rendered HTML), while a thin client wrapper handles interactive tag toggling and pagination without full page reloads. The `ContentListingClient` component receives pre-filtered, pre-paginated items from the server instead of all items.

**Tech Stack:** Next.js 16 (App Router, `'use cache'`), React 19, TypeScript, Tailwind CSS, shadcn/ui

---

### Task 1: Restore `searchParams` to the Content Listing Page

**Files:**
- Modify: `src/app/[contentType]/page.tsx`

**Step 1: Update PageProps interface to include searchParams**

In `src/app/[contentType]/page.tsx`, update the `PageProps` interface and the page component to accept and use `searchParams` again. The server component will do the filtering/sorting/pagination and pass pre-computed results to the client component.

```tsx
interface PageProps {
  params: Promise<{ contentType: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    tags?: string;
    sort?: string;
  }>;
}
```

**Step 2: Replace `getAllContentByType` with `getContent` for server-side filtering**

Update the page component to use `getContent()` with query params from the URL, instead of loading all items and deferring to the client. Remove `'use cache'` from the page component since `searchParams` makes it dynamic.

```tsx
export default async function ContentTypePage({
  params,
  searchParams,
}: PageProps) {
  const { contentType } = await params;
  const searchParamsResolved = await searchParams;

  if (!isValidContentType(contentType)) {
    notFound();
  }

  const config = contentConfig.types[contentType];

  // Parse URL search params
  const page = parseInt(searchParamsResolved.page || '1');
  const query = searchParamsResolved.q;
  const tags = searchParamsResolved.tags?.split(',').filter(Boolean);
  const sortParts = searchParamsResolved.sort?.split(':');
  const sortBy = sortParts?.[0] as keyof typeof config.defaultSort;
  const sortOrder = sortParts?.[1] as 'asc' | 'desc';

  const { items, pagination } = await getContent({
    contentType,
    page,
    pageSize: config.pageSize || contentConfig.defaults.pageSize,
    query,
    tags,
    sortBy: sortBy || config.defaultSort?.field,
    sortOrder: sortOrder || config.defaultSort?.order,
  });

  const allTags = await getTagsForType(contentType);
  const breadcrumbs = generateContentBreadcrumbs(config);

  const description = `Browse all ${config.namePlural.toLowerCase()}`;
  const url = `${seoConfig.siteUrl}/${contentType}`;

  return (
    <>
      <JsonLd data={generateCollectionPageSchema(config.namePlural, description, url, pagination.totalItems)} />
      <ContentListingClient
        items={items}
        allTags={allTags}
        contentType={contentType}
        config={config}
        breadcrumbs={breadcrumbs}
        pagination={pagination}
        activeTags={tags || []}
        activeQuery={query}
        activeSortBy={sortBy || config.defaultSort?.field || contentConfig.defaults.sortField}
        activeSortOrder={sortOrder || config.defaultSort?.order || contentConfig.defaults.sortOrder}
      />
    </>
  );
}
```

**Step 3: Remove `ContentListingFallback` and `Suspense` wrapper**

Delete the `ContentListingFallback` function and remove the `Suspense` import — they're no longer needed since the page is server-rendered with data.

**Step 4: Clean up unused imports**

Remove imports for `Suspense`, `cacheLife`, `getAllContentByType`. Add import for `getContent`.

**Step 5: Verify the file compiles**

Run: `pnpm build 2>&1 | head -40`
Expected: No TypeScript errors in this file (ContentListingClient will error until Task 2).

**Step 6: Commit**

```bash
git add src/app/[contentType]/page.tsx
git commit -m "fix: restore server-side rendering for content listing page

Server-renders filtered/paginated content using searchParams so crawlers
and direct URL access get fully rendered HTML instead of a skeleton fallback."
```

---

### Task 2: Refactor ContentListingClient to Receive Pre-Filtered Items

**Files:**
- Modify: `src/app/[contentType]/ContentListingClient.tsx`

**Step 1: Update props interface**

Change the component to receive pre-filtered items and pagination from the server, instead of all items. Remove client-side filtering/sorting/pagination logic.

```tsx
interface ContentListingClientProps {
  items: ContentItem[];
  allTags: Record<string, number>;
  contentType: string;
  config: ContentTypeConfig;
  breadcrumbs: BreadcrumbItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  activeTags: string[];
  activeQuery?: string;
  activeSortBy: string;
  activeSortOrder: 'asc' | 'desc';
}
```

**Step 2: Replace filtering useMemo with direct prop usage**

Remove the `useMemo` that filters/sorts/paginates `allItems`. The component now uses `items` and `pagination` directly from props. Keep the `buildUrl` helper and navigation callbacks, but use `activeTags` etc. from props instead of parsing `searchParams`.

```tsx
export default function ContentListingClient({
  items,
  allTags,
  contentType,
  config,
  breadcrumbs,
  pagination,
  activeTags,
  activeQuery,
  activeSortBy,
  activeSortOrder,
}: ContentListingClientProps) {
  const router = useRouter();

  // Build URL helper
  const buildUrl = useCallback(
    (overrides: { page?: number; tags?: string[]; q?: string; sort?: string }) => {
      const params = new URLSearchParams();
      const newPage = overrides.page ?? pagination.page;
      const newTags = overrides.tags ?? activeTags;
      const newQuery = overrides.q !== undefined ? overrides.q : activeQuery;
      const newSort = overrides.sort ?? `${activeSortBy}:${activeSortOrder}`;

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
      router.push(url);
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
  // ... rest of JSX stays the same but use activeTags instead of tags,
  // and items/pagination directly from props
```

**Step 3: Update JSX to use props**

In the JSX, replace all references to the old `tags` variable with `activeTags`. Replace `pagination.totalItems` (from useMemo) with `pagination.totalItems` (from props — same name, different source). The JSX structure stays identical.

**Step 4: Remove unused imports**

Remove `useSearchParams` and `useMemo` imports — they're no longer needed.

**Step 5: Change `router.replace` to `router.push`**

Navigation should use `router.push` (not `replace`) so browser back/forward works with filters. This was a UX issue in the original.

**Step 6: Verify build**

Run: `pnpm build 2>&1 | head -40`
Expected: Clean build with no errors.

**Step 7: Commit**

```bash
git add src/app/[contentType]/ContentListingClient.tsx
git commit -m "refactor: ContentListingClient receives pre-filtered items from server

Removes client-side filtering/sorting/pagination. Component now renders
server-provided items directly, fixing the tags array memoization bug
and ensuring SSR content matches URL params."
```

---

### Task 3: Update CLAUDE.md to Reflect Next.js 16

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Read the current CLAUDE.md**

Read `CLAUDE.md` to get the exact current content.

**Step 2: Update the version reference**

Change "Next.js 15" to "Next.js 16" in the Architecture section (line 16).

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to reflect Next.js 16 upgrade"
```

---

### Task 4: Manual Verification

**Step 1: Start dev server**

Run: `pnpm dev`

**Step 2: Verify server-rendered content**

Use curl or d3k to check that `/articles` returns fully rendered HTML (not a skeleton):

```bash
curl -s http://localhost:3000/articles | grep -o '<h1[^>]*>.*</h1>' | head -1
```

Expected: Should contain the content type title (e.g., "Articles"), not empty/skeleton markup.

**Step 3: Verify filtered URLs are server-rendered**

```bash
curl -s "http://localhost:3000/articles?tags=react" | grep -c 'animate-pulse'
```

Expected: `0` (no skeleton pulse animations in the server-rendered HTML).

**Step 4: Verify pagination URLs work**

```bash
curl -s "http://localhost:3000/articles?page=1" | grep -o 'items found' | head -1
```

Expected: Should show item count in the rendered HTML.

**Step 5: Verify client-side interactivity**

Open `http://localhost:3000/articles` in browser. Click a tag filter — the URL should update and content should re-render. Click pagination — should navigate. Browser back button should work.

**Step 6: Stop dev server and run full build**

Run: `pnpm build`
Expected: Clean build with no errors.

---

## Summary of Changes

| File | Change | Why |
|------|--------|-----|
| `src/app/[contentType]/page.tsx` | Restore `searchParams`, remove `'use cache'` from page, use `getContent()` | Fix SEO regression — server-render filtered content |
| `src/app/[contentType]/ContentListingClient.tsx` | Receive pre-filtered items, remove client-side filtering | Fix memoization bug, reduce client JS payload |
| `CLAUDE.md` | "Next.js 15" → "Next.js 16" | Accuracy |
