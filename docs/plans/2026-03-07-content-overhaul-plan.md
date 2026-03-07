# Content Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace dev-specific content and branding with domain-neutral template documentation that teaches users how the template works.

**Architecture:** Config-only and content-only changes. Update two config files for branding, delete 6 MDX files, create 10 new MDX files. No structural or component code changes.

**Tech Stack:** MDX, TypeScript config files

---

### Task 1: Update directory.config.ts branding

**Files:**
- Modify: `src/config/directory.config.ts`

**Step 1: Update the config**

Replace the full file contents with:

```typescript
import { DirectoryConfig } from '@/types/content';
import { SEOConfig } from '@/lib/content/types';

export const directoryConfig: DirectoryConfig = {
  name: 'Starter Directory',
  description: 'A boilerplate for building content directories with Next.js',
  itemsPerPage: 9,
  features: {
    images: true,
    tags: true,
    search: true,
    pagination: true,
  },
  theme: {
    fontHeading: 'Cormorant_Garamond',
    fontBody: 'Nunito',
  },
};

export const seoConfig: SEOConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://starter-directory.example.com',
  siteName: directoryConfig.name,
  description: directoryConfig.description,
  twitterHandle: '@starterdirectory',
  socialLinks: [
    'https://github.com/your-username/your-repo',
    'https://twitter.com/starterdirectory',
  ],
  logo: '/logo.svg',
  defaultOgImage: '/og-default.png',
  defaultAuthor: 'Starter Directory Team',
  defaultKeywords: ['directory', 'boilerplate', 'nextjs', 'template', 'starter'],
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};
```

**Step 2: Verify the build still works**

Run: `cd /Users/huntsyea/Dev/nextjs-directory-boilerplate && pnpm build`
Expected: Build succeeds (content pages still render with old MDX files)

**Step 3: Commit**

```bash
git add src/config/directory.config.ts
git commit -m "chore: update branding to generic Starter Directory template"
```

---

### Task 2: Delete old content files

**Files:**
- Delete: `content/articles/example-1.mdx`
- Delete: `content/articles/example-2.mdx`
- Delete: `content/articles/web-performance-essentials.mdx`
- Delete: `content/guides/building-a-design-system.mdx`
- Delete: `content/guides/content-strategy-for-developers.mdx`
- Delete: `content/guides/getting-started-with-nextjs.mdx`

**Step 1: Remove all existing content**

```bash
rm content/articles/example-1.mdx content/articles/example-2.mdx content/articles/web-performance-essentials.mdx
rm content/guides/building-a-design-system.mdx content/guides/content-strategy-for-developers.mdx content/guides/getting-started-with-nextjs.mdx
```

**Step 2: Verify directories still exist**

```bash
ls content/articles/ content/guides/
```

Expected: Empty directories

---

### Task 3: Create article — How the Content System Works

**Files:**
- Create: `content/articles/content-system-overview.mdx`

**Step 1: Write the file**

```mdx
---
title: 'How the Content System Works'
topic: 'Architecture'
image: '/example1.png'
summary: 'An overview of the unified, config-driven content system that powers this template — from MDX files to rendered pages.'
tags: ['content', 'architecture']
date: '2024-01-10'
author: 'Starter Directory Team'
---

This template uses a unified content system that turns MDX files into fully rendered pages with listing, filtering, and detail views — all driven by configuration.

## Content Directory Structure

All content lives in the `content/` directory, organized by type:

\`\`\`
content/
  articles/     # Blog-style articles
  guides/       # How-to guides and tutorials
  [your-type]/  # Add your own content types
\`\`\`

Each MDX file in these directories becomes a page on your site automatically.

## Frontmatter

Every content file starts with YAML frontmatter that defines its metadata:

\`\`\`yaml
---
title: 'Your Post Title'
summary: 'A short description for cards and SEO.'
date: '2024-01-15'
author: 'Your Name'
image: '/your-image.png'
tags: ['tag-one', 'tag-two']
topic: 'Category'
---
\`\`\`

The `title` field is required. All other fields are optional but recommended for the best display.

## How Content Gets Loaded

The content loader at `src/lib/content/loader.ts` provides several functions:

- **getContent()** — Paginated content with optional filtering by type or tag
- **getContentBySlug()** — Fetch a single item by its slug (filename)
- **getContentByTag()** — Filter content by a specific tag
- **getAllTags()** — Get all tags used across your content
- **getAllContentSlugs()** — Used for static page generation

## Automatic Routing

Routes are generated automatically based on content type and filename:

- `/articles` — Lists all articles
- `/articles/content-system-overview` — This page (slug from filename)
- `/tags/content` — All items tagged "content"

No manual route configuration needed. Add a file, get a page.

## What to Do Next

Replace these placeholder files with your own content. See the "Adding and Managing Content" guide for a step-by-step walkthrough.
```

---

### Task 4: Create article — Theming and Dark Mode Support

**Files:**
- Create: `content/articles/theming-and-dark-mode.mdx`

**Step 1: Write the file**

```mdx
---
title: 'Theming and Dark Mode Support'
topic: 'Customization'
image: '/example2.png'
summary: 'How this template handles theming, dark mode, and CSS custom properties for a consistent visual experience.'
tags: ['customization', 'theming']
date: '2024-01-09'
author: 'Starter Directory Team'
---

This template includes built-in dark mode support and a flexible theming system powered by CSS custom properties and `next-themes`.

## How Dark Mode Works

The theme system uses `next-themes` with automatic system preference detection. Users can toggle between light and dark modes using the button in the navigation bar.

Theme classes are applied to the root `<html>` element, and CSS variables in `src/app/globals.css` change accordingly:

\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... more variables */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
}
\`\`\`

## Customizing Colors

To change the color palette, edit the CSS custom properties in `globals.css`. The template uses HSL values so you can adjust hue, saturation, and lightness independently.

Key variables to customize:

- `--primary` — Accent color for links, buttons, and highlights
- `--background` / `--foreground` — Base page colors
- `--muted` / `--muted-foreground` — Secondary text and backgrounds
- `--card` / `--card-foreground` — Content card colors

## Fonts

Heading and body fonts are configured in `src/config/directory.config.ts`:

\`\`\`typescript
theme: {
  fontHeading: 'Cormorant_Garamond',
  fontBody: 'Nunito',
},
\`\`\`

Swap these to any Google Font supported by `next/font`. The font files are automatically optimized and self-hosted.

## Components

The `ThemeProvider` component wraps the application and the `ThemeToggle` component provides the UI toggle. Both live in `src/components/` and work out of the box.

## Tip

When customizing colors, always test both light and dark modes. A color that looks great on white may be unreadable on a dark background.
```

---

### Task 5: Create article — Built-in SEO Features

**Files:**
- Create: `content/articles/built-in-seo-features.mdx`

**Step 1: Write the file**

```mdx
---
title: 'Built-in SEO Features'
topic: 'SEO'
image: '/example1.png'
summary: 'This template includes a sitemap, RSS feed, structured data, Open Graph metadata, and robots.txt — all configured automatically.'
tags: ['seo', 'configuration']
date: '2024-01-08'
author: 'Starter Directory Team'
---

Search engine optimization is built into this template from the ground up. Here is what you get out of the box and how to configure it.

## What is Included

### XML Sitemap

Generated automatically at `/sitemap.xml` from all your content. Search engines use this to discover and index your pages. The sitemap updates whenever you add or remove content.

### RSS Feed

Available at `/feed.xml`, allowing readers to subscribe to your content in any RSS reader. The feed includes all content types.

### Robots.txt

Configured at `/robots.txt` to allow search engine crawling. Edit `src/app/robots.ts` to customize rules.

### Structured Data

JSON-LD schema markup is added automatically to pages:

- **Organization** schema on the home page
- **Article** schema on content detail pages
- **Breadcrumb** schema for navigation context

### Open Graph and Twitter Cards

Every page includes Open Graph and Twitter Card metadata for rich social sharing previews. The metadata is generated from your content's frontmatter.

## Configuration

All SEO settings live in `src/config/directory.config.ts`:

\`\`\`typescript
export const seoConfig: SEOConfig = {
  siteUrl: 'https://your-domain.com',
  siteName: 'Your Site Name',
  description: 'Your site description',
  twitterHandle: '@yourhandle',
  defaultAuthor: 'Your Name',
  defaultKeywords: ['your', 'keywords'],
};
\`\`\`

## Per-Page Metadata

Each content file's frontmatter (`title`, `summary`, `image`) is used to generate page-specific metadata. The `summary` field becomes the meta description, and the `image` becomes the Open Graph image.

## Google Verification

Set the `GOOGLE_SITE_VERIFICATION` environment variable to verify your site with Google Search Console.
```

---

### Task 6: Create article — Search and Filtering

**Files:**
- Create: `content/articles/search-and-filtering.mdx`

**Step 1: Write the file**

```mdx
---
title: 'Search and Filtering'
topic: 'Features'
image: '/example2.png'
summary: 'How the built-in search and tag filtering system helps visitors find content quickly across your directory.'
tags: ['content', 'customization']
date: '2024-01-07'
author: 'Starter Directory Team'
---

This template includes client-side search and tag-based filtering so visitors can find content quickly without a backend search service.

## Search

The search component is accessible from the navigation bar via the search icon or keyboard shortcut. It searches across titles, summaries, and tags of all content.

### How It Works

Search is powered by the `useSearch` hook in `src/components/Search/`. It loads content metadata client-side and filters results as the user types. No external search service is required.

### Keyboard Shortcut

Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to open the search dialog from any page.

## Tag Filtering

Tags provide a way to categorize and cross-reference content. Visitors can:

- Click any tag on a content card to see all items with that tag
- Browse tags at `/tags/[tag-name]`
- Filter within a content type listing page

### Adding Tags to Content

Add tags in your MDX frontmatter as an array:

\`\`\`yaml
tags: ['getting-started', 'configuration']
\`\`\`

Tags are displayed as badges on content cards and detail pages. Choose tags that overlap across content types so filtering surfaces relevant results.

## Enabling and Disabling

Both search and tags can be toggled globally in `src/config/content.config.ts`:

\`\`\`typescript
features: {
  search: true,
  tags: true,
  pagination: true,
},
\`\`\`

You can also enable or disable these per content type in the `types` configuration.

## Tip

Use 2-3 tags per content item. Too many tags dilute their usefulness; too few make filtering unhelpful.
```

---

### Task 7: Create article — Responsive Design and Components

**Files:**
- Create: `content/articles/responsive-design-and-components.mdx`

**Step 1: Write the file**

```mdx
---
title: 'Responsive Design and Components'
topic: 'Components'
image: '/example1.png'
summary: 'An overview of the UI components included in this template and how they adapt across screen sizes.'
tags: ['components', 'customization']
date: '2024-01-06'
author: 'Starter Directory Team'
---

This template ships with a set of pre-built components designed to look good on every screen size, from mobile phones to wide desktop monitors.

## Component Library

The UI is built on shadcn/ui primitives located in `src/components/ui/`. These are unstyled, accessible components that you can customize freely:

- **Button** — Multiple variants (default, outline, ghost)
- **Card** — Content container with header, body, and footer slots
- **Badge** — Small labels for tags and categories
- **Input** — Form inputs with consistent styling
- **Dialog** — Modal overlays for search and confirmations
- **Dropdown Menu** — Navigation and action menus

## Layout Components

Higher-level layout components in `src/components/layout/` handle content presentation:

### ContentCard

Displays a single content item with image, title, summary, tags, and date. Supports three variants:

- **default** — Standard card with image
- **featured** — Larger card for hero placement
- **compact** — Minimal card without image

### ContentGrid

Arranges ContentCards in a responsive grid that adapts from 1 column on mobile to 3 columns on desktop.

## Navigation

- **Header** — Sticky navigation with logo, links, search shortcut, and theme toggle. Collapses to a hamburger menu on mobile.
- **Footer** — Site-wide footer with links and branding
- **MobileMenu** — Full-screen overlay menu for small screens
- **Breadcrumbs** — Contextual navigation on detail pages

## Customizing Components

All components use Tailwind CSS classes and CSS variables. To change the look and feel:

1. Modify CSS variables in `globals.css` for colors and spacing
2. Edit component files directly for structural changes
3. Add new shadcn/ui components with `npx shadcn@latest add [component]`

## Responsive Breakpoints

The template uses Tailwind's default breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). Content grids, navigation, and typography all adapt at these breakpoints.
```

---

### Task 8: Create guide — Getting Started with Starter Directory

**Files:**
- Create: `content/guides/getting-started.mdx`

**Step 1: Write the file**

```mdx
---
title: 'Getting Started with Starter Directory'
topic: 'Setup'
image: '/example2.png'
summary: 'Set up your development environment and run the template locally in under five minutes.'
tags: ['getting-started', 'configuration']
date: '2024-01-05'
author: 'Starter Directory Team'
---

This guide walks you through cloning, installing, and running the Starter Directory template on your local machine.

## Prerequisites

You will need:

- **Node.js 18+** — Check with `node --version`
- **pnpm** — Install with `npm install -g pnpm` if you do not have it

## Installation

Clone the repository and install dependencies:

\`\`\`bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
pnpm install
\`\`\`

## Running Locally

Start the development server:

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser. The site will hot-reload as you make changes.

## Project Structure

Here are the key directories you will work with:

\`\`\`
content/          # Your MDX content files (articles, guides)
src/
  app/            # Next.js App Router pages and layouts
  components/     # React components (UI, layout, navigation)
  config/         # Site and content configuration
  lib/            # Utilities, content loader, metadata helpers
\`\`\`

## First Steps

1. **Edit site config** — Open `src/config/directory.config.ts` and set your site name, description, and SEO settings
2. **Replace content** — Delete the placeholder files in `content/` and add your own MDX files
3. **Customize theme** — Edit CSS variables in `src/app/globals.css` to match your brand colors

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Next Steps

Read the "Adding and Managing Content" guide to learn how to create your first real content, or the "Customizing Your Site" guide to personalize the look and feel.
```

---

### Task 9: Create guide — Adding and Managing Content

**Files:**
- Create: `content/guides/adding-content.mdx`

**Step 1: Write the file**

```mdx
---
title: 'Adding and Managing Content'
topic: 'Content'
image: '/example1.png'
summary: 'Learn how to create, organize, and manage MDX content files in your directory.'
tags: ['content', 'getting-started']
date: '2024-01-04'
author: 'Starter Directory Team'
---

Adding content to your directory is as simple as creating an MDX file in the right folder. This guide covers everything you need to know.

## Creating a New Post

1. Choose the content type (e.g., `articles` or `guides`)
2. Create a new `.mdx` file in `content/[type]/`
3. Add frontmatter at the top of the file
4. Write your content in Markdown below the frontmatter

### Example

Create `content/articles/my-first-post.mdx`:

\`\`\`mdx
---
title: 'My First Post'
summary: 'A brief introduction to my new directory site.'
date: '2024-02-01'
author: 'Your Name'
image: '/my-image.png'
tags: ['introduction']
topic: 'General'
---

Write your content here using standard Markdown syntax.

## You Can Use Headings

And **bold text**, *italics*, [links](https://example.com),
code blocks, lists, and everything else Markdown supports.
\`\`\`

## File Naming

The filename becomes the URL slug. `my-first-post.mdx` becomes `/articles/my-first-post`. Use lowercase, hyphen-separated names.

## Images

Place images in the `public/` directory and reference them with an absolute path:

\`\`\`yaml
image: '/my-image.png'
\`\`\`

The image appears on content cards and at the top of detail pages.

## Frontmatter Reference

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Display title |
| `summary` | No | Short description for cards and SEO |
| `date` | No | Publication date (YYYY-MM-DD) |
| `author` | No | Author name |
| `image` | No | Path to cover image in `public/` |
| `tags` | No | Array of tag strings |
| `topic` | No | Category label |

## Deleting Content

Remove the MDX file and the page disappears. No configuration changes needed.

## Ordering

Content is sorted by date (newest first) by default. To change the sort order, edit the `defaultSort` setting in `src/config/content.config.ts`.
```

---

### Task 10: Create guide — Adding a New Content Type

**Files:**
- Create: `content/guides/adding-a-content-type.mdx`

**Step 1: Write the file**

```mdx
---
title: 'Adding a New Content Type'
topic: 'Configuration'
image: '/example2.png'
summary: 'Step-by-step instructions for adding a custom content type beyond the default articles and guides.'
tags: ['content', 'configuration']
date: '2024-01-03'
author: 'Starter Directory Team'
---

The template ships with two content types — articles and guides — but you can add as many as you need. This guide shows you how.

## Step 1: Create the Content Directory

Create a new folder inside `content/`:

\`\`\`bash
mkdir content/resources
\`\`\`

## Step 2: Add the Type Configuration

Open `src/config/content.config.ts` and add a new entry to the `types` object:

\`\`\`typescript
resources: {
  slug: 'resources',
  name: 'Resource',
  namePlural: 'Resources',
  directory: 'resources',
  requiredFields: ['title'],
  features: {
    images: true,
    tags: true,
    search: true,
    pagination: true,
  },
  defaultSort: {
    field: 'date',
    order: 'desc',
  },
  card: {
    showImage: true,
    showSummary: true,
    showTags: true,
    showDate: true,
  },
  detail: {
    showImage: true,
    showTags: true,
    showDate: true,
    showAuthor: true,
  },
},
\`\`\`

## Step 3: Add Content

Create MDX files in your new directory with the standard frontmatter:

\`\`\`mdx
---
title: 'Useful Design Tools'
summary: 'A curated list of design tools for web projects.'
date: '2024-02-01'
tags: ['design', 'tools']
author: 'Your Name'
---

Your content here.
\`\`\`

## Step 4: Verify

Start the dev server with `pnpm dev` and visit:

- `/resources` — Your new listing page
- `/resources/useful-design-tools` — The detail page

Both routes are created automatically. The home page will also show a "Resources" section if content exists.

## Configuration Options

You can toggle features per content type. For example, to create a type without images:

\`\`\`typescript
card: {
  showImage: false,
  showSummary: true,
  showTags: true,
  showDate: true,
},
\`\`\`

## That is It

No routing changes, no component modifications. The content system handles everything based on your configuration.
```

---

### Task 11: Create guide — Customizing Your Site

**Files:**
- Create: `content/guides/customizing-your-site.mdx`

**Step 1: Write the file**

```mdx
---
title: 'Customizing Your Site'
topic: 'Customization'
image: '/example1.png'
summary: 'How to personalize the branding, colors, fonts, and layout of your directory site.'
tags: ['customization', 'configuration']
date: '2024-01-02'
author: 'Starter Directory Team'
---

This guide covers all the ways you can make this template your own, from basic branding to deeper visual customization.

## Site Identity

Edit `src/config/directory.config.ts` to set your site name, description, and SEO details:

\`\`\`typescript
export const directoryConfig: DirectoryConfig = {
  name: 'Your Site Name',
  description: 'Your tagline or description',
  // ...
};
\`\`\`

This name appears in the header, browser tab, and all SEO metadata.

## Colors

The color system uses CSS custom properties defined in `src/app/globals.css`. To change your primary accent color, update the `--primary` variable in both the `:root` (light) and `.dark` (dark mode) blocks.

Common variables to customize:

| Variable | Purpose |
|----------|---------|
| `--primary` | Accent color (links, buttons) |
| `--background` | Page background |
| `--foreground` | Main text color |
| `--muted` | Secondary backgrounds |
| `--card` | Card backgrounds |

## Fonts

Change heading and body fonts in `directory.config.ts`:

\`\`\`typescript
theme: {
  fontHeading: 'Your_Heading_Font',
  fontBody: 'Your_Body_Font',
},
\`\`\`

Use any font available through `next/font/google`. The font name should use underscores instead of spaces.

## Content Features

Toggle features globally or per content type in `src/config/content.config.ts`:

\`\`\`typescript
features: {
  images: true,    // Show cover images
  tags: true,      // Enable tag filtering
  search: true,    // Enable search
  pagination: true, // Enable pagination
},
\`\`\`

## Logo

Replace `/public/logo.svg` with your own logo file. Update the path in `seoConfig` if you use a different filename.

## Pagination

Change items per page in `directory.config.ts`:

\`\`\`typescript
itemsPerPage: 12, // Default is 9
\`\`\`

## Going Further

For deeper customization, edit the components directly in `src/components/`. The template uses Tailwind CSS, so most styling changes are straightforward class modifications.
```

---

### Task 12: Create guide — Deploying to Production

**Files:**
- Create: `content/guides/deploying-to-production.mdx`

**Step 1: Write the file**

```mdx
---
title: 'Deploying to Production'
topic: 'Deployment'
image: '/example2.png'
summary: 'How to build, optimize, and deploy your directory site to production with Vercel or any static host.'
tags: ['seo', 'getting-started']
date: '2024-01-01'
author: 'Starter Directory Team'
---

Once your content is ready, deploying to production takes just a few steps. This guide covers building, environment setup, and deployment options.

## Building for Production

Run the production build:

\`\`\`bash
pnpm build
\`\`\`

This generates an optimized build in the `.next/` directory. The build process will:

- Pre-render all static pages
- Generate the XML sitemap and RSS feed
- Optimize images and fonts
- Bundle and minify JavaScript and CSS

## Environment Variables

Set these in your hosting platform's environment settings:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Your production URL (used for sitemap, OG tags) |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification code |

## Deploying to Vercel

The fastest option for Next.js sites:

1. Push your repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Vercel detects Next.js automatically and configures the build
4. Set your environment variables in the Vercel dashboard
5. Deploy

Every push to your main branch triggers a new deployment automatically.

## Other Hosting Options

This template works with any platform that supports Next.js:

- **Netlify** — Use the Next.js runtime plugin
- **AWS Amplify** — Supports Next.js App Router
- **Self-hosted** — Run `pnpm start` behind a reverse proxy

## Post-Deployment Checklist

After your first deployment:

- [ ] Verify your site loads at your custom domain
- [ ] Check `/sitemap.xml` is accessible
- [ ] Test `/feed.xml` in an RSS reader
- [ ] Submit your sitemap to Google Search Console
- [ ] Test social sharing previews with Open Graph debuggers
- [ ] Confirm dark mode works in production

## Performance

The template is optimized for performance out of the box. Run a Lighthouse audit on your deployed site to confirm scores. Aim for 90+ across all categories.
```

---

### Task 13: Verify build and commit all content

**Files:**
- All new MDX files created in Tasks 3-12

**Step 1: Verify all 10 content files exist**

```bash
ls content/articles/ content/guides/
```

Expected:
- articles: `built-in-seo-features.mdx`, `content-system-overview.mdx`, `responsive-design-and-components.mdx`, `search-and-filtering.mdx`, `theming-and-dark-mode.mdx`
- guides: `adding-a-content-type.mdx`, `adding-content.mdx`, `customizing-your-site.mdx`, `deploying-to-production.mdx`, `getting-started.mdx`

**Step 2: Run production build**

```bash
cd /Users/huntsyea/Dev/nextjs-directory-boilerplate && pnpm build
```

Expected: Build succeeds with no errors

**Step 3: Spot-check dev server**

```bash
pnpm dev
```

Manually verify:
- Home page shows "Starter Directory" branding with articles and guides sections
- `/articles` lists 5 articles
- `/guides` lists 5 guides
- Clicking a tag filters content correctly
- Detail pages render MDX content with code blocks

**Step 4: Commit all content changes**

```bash
git add content/ docs/plans/
git commit -m "feat: replace dev content with template documentation placeholder content

- Delete 6 dev-specific MDX files
- Add 5 articles covering template features (content system, theming, SEO, search, components)
- Add 5 guides covering template usage (getting started, adding content, new types, customization, deployment)
- Add design doc and implementation plan"
```

---

### Task 14: Final verification and cleanup

**Step 1: Run lint**

```bash
pnpm lint
```

Expected: No errors

**Step 2: Run full build one more time**

```bash
pnpm build
```

Expected: Clean build with no warnings related to content

**Step 3: Verify git status is clean**

```bash
git status
```

Expected: Clean working tree (except any pre-existing uncommitted changes in `src/app/page.tsx`)
