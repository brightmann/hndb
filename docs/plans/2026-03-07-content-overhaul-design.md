# Content Overhaul Design

## Goal

Replace dev-specific content and branding with domain-neutral placeholder content that serves as template documentation, clearly signaling "replace me" while teaching users how the template works.

## Branding

- Site name: "Starter Directory"
- Tagline: "A boilerplate for building content directories with Next.js"
- Author: "Starter Directory Team"
- Keywords: directory, boilerplate, nextjs, template, starter
- Site URL: https://starter-directory.example.com

## Content Plan

### Articles (5) - Feature overviews

| File | Title | Tags |
|------|-------|------|
| content-system-overview.mdx | How the Content System Works | content, architecture |
| theming-and-dark-mode.mdx | Theming and Dark Mode Support | customization, theming |
| built-in-seo-features.mdx | Built-in SEO Features | seo, configuration |
| search-and-filtering.mdx | Search and Filtering | content, customization |
| responsive-design-and-components.mdx | Responsive Design and Components | components, customization |

### Guides (5) - How-tos

| File | Title | Tags |
|------|-------|------|
| getting-started.mdx | Getting Started with Starter Directory | getting-started, configuration |
| adding-content.mdx | Adding and Managing Content | content, getting-started |
| adding-a-content-type.mdx | Adding a New Content Type | content, configuration |
| customizing-your-site.mdx | Customizing Your Site | customization, configuration |
| deploying-to-production.mdx | Deploying to Production | seo, getting-started |

### Tag overlap

- content (3), customization (3), configuration (3), getting-started (2), seo (2), theming (1), architecture (1), components (1)

### Content style

- 300-500 words of real template docs per piece
- Second person voice
- Code snippets where relevant
- Sequential dates (Jan 1-10, 2024)
- Alternating placeholder images (/example1.png, /example2.png)

## Scope

- Delete all 6 existing MDX files
- Create 10 new MDX files
- Update directory.config.ts (branding, SEO)
- No structural/code changes
