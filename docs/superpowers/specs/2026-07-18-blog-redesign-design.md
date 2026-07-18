# Blog Redesign — Design

**Date:** 2026-07-18
**Status:** Approved

## Goal

Restructure the blog with a clearer design, numbered pagination, and new features:
categories/tags (with dedicated pages), client-side search, reading time, and a
featured hero post. Scale cleanly past the current 10 posts.

## Current State

- `src/lib/blog.ts` — flat `posts: BlogPost[]` array (10 posts). Fields:
  `slug, title, description, date, keywords?, relatedTools?, body`.
- `src/app/(site)/blog/page.tsx` — plain card grid, no pagination.
- `src/app/(site)/blog/[slug]/page.tsx` — markdown render + share + related tools.
- `src/lib/seo.ts` — `getBlogIndexMetadata`, `createBlogPostMetadata`,
  `blogPostJsonLd`, `absoluteUrl`, `breadcrumbJsonLd`, `createMetadata`.
- Next.js 15, Tailwind, deployed via open-next to Cloudflare. Static generation.

## Data Model

Extend `BlogPost` in `src/lib/blog.ts`:

```ts
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;          // ISO, e.g. '2026-07-14'
  keywords?: string[];
  relatedTools?: string[];
  body: string;
  category: string;      // single primary category, e.g. 'PDF', 'Developer', 'Security'
  tags?: string[];       // freeform, e.g. ['json', 'validation']
}
```

Backfill `category` on all 10 existing posts. Category set derived from content:
`PDF`, `Developer`, `Security`, `Image`, `Text`. Add relevant `tags` where obvious.

### Derived helpers (pure functions, no stored fields)

- `readingTime(post): number` — `Math.ceil(wordCount(post.body) / 220)` minutes.
- `getAllCategories(): { name: string; count: number }[]` — unique categories + counts.
- `getPostsByCategory(cat: string): BlogPost[]`
- `getPostsByTag(tag: string): BlogPost[]`
- `paginate<T>(items: T[], page: number, perPage = 6): { items: T[]; page: number; totalPages: number }`

`getAllPosts()` already returns posts sorted newest-first (verify; sort if not).

## Routes

| Route | Purpose |
|---|---|
| `/blog` | Page 1: hero (newest post) + category chips + search + paginated grid (posts 1..6) |
| `/blog/page/[page]` | Pages 2..N — no hero, chips + search + grid |
| `/blog/category/[cat]` | Category-filtered listing, own pagination |
| `/blog/[slug]` | Post detail — add reading-time + category badge |

- `perPage = 6` (grid slots). Pagination rule:
  - Page 1 = `hero(post[0])` + `grid(post[1..6])` — hero is the newest post, not repeated in the grid.
  - Page 2 = `grid(post[7..12])`, page 3 = `grid(post[13..18])`, etc. No hero after page 1.
  - `totalPages = 1 + ceil((totalPosts - 1 - 6) / 6)` when `totalPosts > 7`, else `1`.
    (Page 1 consumes hero + 6 = 7 posts; each later page consumes 6.)
- `generateStaticParams` for `/blog/page/[page]` (2..totalPages) and `/blog/category/[cat]` (each category). All static — compatible with open-next.
- Category slug: kebab-case of category name (`getPostsByCategory` matches case-insensitively). Helper `categorySlug(name)` + `categoryFromSlug(slug)`.

## Components

New, small, single-purpose (in `src/components/blog/`):

- `BlogCard` — reusable card: date · category badge · reading time · title · description · "Read guide" affordance. Replaces inline markup in index.
- `BlogHero` — large featured card for the newest post, page 1 only.
- `CategoryChips` — server-rendered links to `/blog/category/[cat]`, active state highlighting.
- `BlogSearch` — client component. Filters the currently rendered cards by
  title/description/tags. Instant, no route change. Wraps the grid; when a query is
  active it hides non-matching cards and hides the hero + pagination.
- `Pagination` — numbered links (`‹ 1 2 3 ›`), shared by index and category pages.
  Takes `basePath`, `page`, `totalPages`. Page-1 link points to base (e.g. `/blog`),
  page N to `${basePath}/page/N` (for index) or `${basePath}/page/N` pattern for categories.

## Search Approach (chosen: A)

Client-side filter over the posts rendered on the current page only. No extra data
shipped, matches the numbered-pagination model. With 10 posts this is sufficient.
Revisit a shipped JSON search index (approach B) if posts grow past ~50.

## SEO

- **Category pages:** `createMetadata` (title `"<Category> Guides | <siteName>"`, path
  `/blog/category/<slug>`) + `CollectionPage` JSON-LD + breadcrumb Home › Blog › Category.
- **Paginated index pages** (`/blog/page/[page]`): `createMetadata` with self canonical;
  `/blog` remains the primary/canonical entry. Title may append `" – Page N"`.
- **Post detail:** add `articleSection: post.category` to Article JSON-LD; merge
  `tags` into the `keywords` string.
- New SEO helpers as needed: `getBlogCategoryMetadata(cat)`, `getBlogPageMetadata(page)`,
  `blogCategoryJsonLd(cat, posts)`.

## Detail Page Changes

- Add category badge + reading time under the date in the header.
- Keep existing markdown render, share buttons, related-tools rail unchanged.

## Styling

Follow existing Tailwind conventions (`bg-muted/20`, `border-border/60`, `bg-card`,
`text-muted-foreground`). Category badge = small rounded pill using `primary` accent.
Reuse `.blog-content` CSS for post bodies unchanged.

## Out of Scope (YAGNI)

- Author profiles, cover/hero images per post, comments, RSS-per-category.
- Server-side full-text search / shipped search index (approach B).
- Tag-dedicated pages beyond category pages (tags used only for search filtering now).

## Testing / Verification

- Build succeeds (`next build`) with all static params generated.
- `/blog`, `/blog/page/2`, `/blog/category/pdf` render correct post sets.
- Pagination links resolve; no 404s within range; out-of-range → `notFound()`.
- Search filters visible cards; clearing restores full view.
- Reading time computed and displayed on cards + detail.
- JSON-LD valid for category + post pages.
