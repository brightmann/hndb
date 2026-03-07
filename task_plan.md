# Plan: Next.js 16 Static Directory Boilerplate — Best Practices + SEO

## Goal
Convert this directory boilerplate from dynamically-rendered serverless functions to a fully static/cached site using Next.js 16 Cache Components, with best-practice SEO for a forkable template. Near-zero compute costs on Vercel.

## Current State
- Next.js 15.1.0, all pages render as serverless functions on every request
- ~1.5K edge requests/day, 2.17 GB-hrs compute for a static content site
- Content is filesystem-based MDX — perfect candidate for full static generation

## Root Causes of Serverless Invocations
| Route | Why It's Dynamic | Impact |
|-------|-----------------|--------|
| `/` (home) | No static/cache directive | Every visit = serverless invocation |
| `/[contentType]` (listing) | `searchParams` access forces dynamic rendering | **Biggest offender** — every `/articles`, `/guides` visit |
| `/[contentType]/[slug]` (detail) | Missing `dynamicParams = false` | Unknown slugs trigger serverless |
| `/tags/[tag]` | Missing `dynamicParams = false` | Unknown tags trigger serverless |
| `/feed.xml` | Route handler, no static export | Every RSS fetch = serverless |
| `/sitemap.xml` | No static export | Every crawl = serverless |

## SEO Audit Findings
| Issue | Current State | Impact |
|-------|--------------|--------|
| No dynamic OG images | No `opengraph-image.tsx` files | Generic/missing social previews per content item |
| Detail page missing JSON-LD | `generateArticleSchema()` exists but is never rendered in `[slug]/page.tsx` | No Article structured data for Google |
| Listing pages missing JSON-LD | `generateCollectionPageSchema()` exists but unused | No CollectionPage structured data |
| Tag pages missing JSON-LD | No structured data | Missing search context |
| Detail page not using `generateContentMetadata()` | Hand-rolls metadata instead of using the helper in `src/lib/metadata.ts` | Inconsistent metadata, missing canonical URLs |
| Tag page not using `generateTagMetadata()` | Hand-rolls metadata | Missing canonical URLs |
| Duplicate content loader calls | `generateMetadata` and page component both call `getContentBySlug` separately | Data waterfall; should use React `cache()` |
| Missing `sizes` on `fill` images | d3k flagged warnings | Browser downloads oversized images, hurts CWV |
| `robots.ts` is dynamic | No `force-static` | Serverless invocation on every crawl |
| `middleware.ts` not renamed | Next.js 16 renames to `proxy.ts` | Not a current issue (no middleware file exists) |

---

## Phase 1: Upgrade to Next.js 16
- [ ] Upgrade `next` to v16 (and `eslint-config-next`)
- [ ] Convert `next.config.mjs` to `next.config.ts`
- [ ] Enable `cacheComponents: true` in next config
- [ ] Run Next.js codemod: `npx @next/codemod@latest upgrade`
- [ ] Run `pnpm build` to verify no breakage
- [ ] Fix any async API changes (params/searchParams already async — should be clean)

## Phase 2: Cache the Content Layer
- [ ] Wrap content loader functions with `'use cache'` + `cacheLife('max')` in `src/lib/content/loader.ts`
- [ ] Remove the in-memory `contentCache` Map (redundant with `use cache`)
- [ ] Add `cacheTag()` calls for granular invalidation (e.g., `cacheTag('content', contentType)`)
- [ ] Wrap `getContentBySlug` with React `cache()` so `generateMetadata` and page component share a single call (avoid data waterfall)

## Phase 3: Static/Cached Pages
- [ ] **Home page** (`/`): Add `'use cache'` at page level with `cacheLife('max')`
- [ ] **Listing page** (`/[contentType]`): Refactor to static shell + client-side filtering
  - Cached server component loads ALL content for the type via `'use cache'`
  - Pass full item list to a client component that handles filtering/pagination/sorting
  - Client component reads `searchParams` via `useSearchParams()` wrapped in `<Suspense>`
  - URL state preserved via `useRouter().replace()` for filter/sort/page changes
  - This eliminates the server-side `searchParams` dynamic opt-out entirely
- [ ] **Detail page** (`/[contentType]/[slug]`): Add `export const dynamicParams = false`
- [ ] **Tag page** (`/tags/[tag]`): Add `export const dynamicParams = false`

## Phase 4: SEO — Metadata & Structured Data
- [ ] **Detail page**: Use `generateContentMetadata()` helper instead of hand-rolled metadata (adds canonical URL, proper OG article type, author, tags)
- [ ] **Detail page**: Render `generateArticleSchema()` as JSON-LD (the function exists, just never called)
- [ ] **Detail page**: Render `generateBreadcrumbSchema()` as JSON-LD
- [ ] **Listing page**: Use `generatePageMetadata()` with canonical URL
- [ ] **Listing page**: Render `generateCollectionPageSchema()` as JSON-LD
- [ ] **Tag page**: Use `generateTagMetadata()` helper instead of hand-rolled metadata
- [ ] **Tag page**: Render `generateCollectionPageSchema()` as JSON-LD
- [ ] **Home page**: Add JSON-LD for WebSite + Organization (already in layout — verify not duplicated)

## Phase 5: SEO — Dynamic OG Images
- [ ] Create `src/app/[contentType]/[slug]/opengraph-image.tsx` — generates per-article OG images using `next/og` with title, author, date
- [ ] Create `src/app/opengraph-image.tsx` — site-level OG image (or keep static file if one exists)
- [ ] Ensure OG images use Node.js runtime (not Edge — not supported with cache components)
- [ ] Add `generateStaticParams` to OG image routes so they're prerendered at build

## Phase 6: Static Route Handlers & Infra
- [ ] **feed.xml**: Add `export const dynamic = 'force-static'` (content only changes on deploy)
- [ ] **sitemap.ts**: Add `export const dynamic = 'force-static'`
- [ ] **robots.ts**: Add `export const dynamic = 'force-static'` (pure config, no runtime data)

## Phase 7: Image Optimization
- [ ] Add `sizes` prop to all `next/image` components with `fill`:
  - Detail page hero: `sizes="100vw"`
  - Content cards in grid: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
  - Featured card: `sizes="(max-width: 768px) 100vw, 66vw"`
- [ ] Verify LCP image has `priority` (already set on detail page hero — confirmed)

## Phase 8: Verify & Validate
- [ ] `pnpm build` — confirm build output shows static/cached pages (look for `○` static, `●` SSG, no `λ` serverless)
- [ ] `d3k errors` — confirm no new browser/server errors
- [ ] Test all routes locally: `/`, `/articles`, `/articles/[slug]`, `/tags/[tag]`, `/feed.xml`, `/sitemap.xml`
- [ ] Verify search/filter/pagination still works client-side on listing pages
- [ ] Verify JSON-LD renders correctly (inspect page source, check with Google Rich Results Test)
- [ ] Verify OG images generate correctly (check `/_next/image` or `/[contentType]/[slug]/opengraph-image`)
- [ ] Validate metadata with social share debuggers (Twitter Card Validator, Facebook Sharing Debugger)
- [ ] Deploy to Vercel preview, check Functions tab shows 0 serverless functions
- [ ] Run Lighthouse audit — target 95+ on Performance and 100 on SEO

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Next.js 16 `use cache` vs `force-static` | `use cache` for pages/loaders | Modern Next.js 16 pattern, granular control with `cacheLife`/`cacheTag`; `force-static` for route handlers (simpler) |
| Listing page filtering | Client-side with `useSearchParams` in Suspense | Only way to avoid `searchParams` dynamic opt-out while keeping URL state; pass data from cached server component |
| `dynamicParams` | `false` on all dynamic routes | Content is known at build time; unknown paths should 404 instantly, not invoke serverless |
| Content loader caching | `use cache` + `cacheLife('max')` + React `cache()` | MDX content only changes on deploy; React `cache()` dedupes within a single render pass (metadata + page) |
| OG images | Dynamic `opengraph-image.tsx` with `next/og` | Per-article social previews are critical for SEO/shareability; static fallback for site-level |
| Structured data | Use existing helper functions | `generateArticleSchema`, `generateCollectionPageSchema`, `generateBreadcrumbSchema` all exist unused — just wire them in |

## Expected Outcome
- 0 serverless function invocations for content pages
- All pages served from CDN edge cache
- Compute usage drops from ~2.17 GB-hrs to near-zero
- Rich structured data on all pages (Article, CollectionPage, BreadcrumbList, WebSite, Organization)
- Dynamic OG images for social sharing
- Canonical URLs on all pages
- Proper `sizes` on all images for optimal CWV
- Search/filter remains functional via client-side logic with Suspense
- Clean build output: all `○` static or `●` SSG, no `λ` lambda
