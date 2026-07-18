# Blog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the blog with numbered pagination, categories/tags (dedicated pages), client-side search, reading time, and a featured hero post.

**Architecture:** Extend the flat `BlogPost` model with `category`/`tags` and add pure derived helpers (reading time, category/tag filters, pagination) to `src/lib/blog.ts`. Build small focused presentational components under `src/components/blog/`. Add static-generated routes for paginated index (`/blog/page/[page]`) and categories (`/blog/category/[cat]`). Search is a client component filtering the currently rendered cards.

**Tech Stack:** Next.js 15 (App Router, static generation), TypeScript, Tailwind CSS, lucide-react. Deployed via open-next to Cloudflare.

**Verification note:** This project has **no test runner** (no vitest/jest). Verification is done via `npx tsc --noEmit` (typecheck), `npm run lint`, `npm run build` (which runs `generateStaticParams`), and explicit render checks against `npm run dev`. Do **not** add a test framework — out of scope.

---

## File Structure

**Modify:**
- `src/lib/blog.ts` — extend `BlogPost` interface; backfill `category`/`tags` on 10 posts; add helpers `readingTime`, `wordCount`, `getAllCategories`, `getPostsByCategory`, `getPostsByTag`, `paginate`, `categorySlug`, `categoryFromSlug`.
- `src/lib/seo.ts` — add `getBlogCategoryMetadata`, `getBlogPageMetadata`, `blogCategoryJsonLd`; extend `blogPostJsonLd` with `articleSection`.
- `src/app/(site)/blog/page.tsx` — page 1: hero + chips + search + grid + pagination.
- `src/app/(site)/blog/[slug]/page.tsx` — add category badge + reading time to header.

**Create:**
- `src/components/blog/BlogCard.tsx`
- `src/components/blog/BlogHero.tsx`
- `src/components/blog/CategoryChips.tsx`
- `src/components/blog/BlogSearch.tsx` (client)
- `src/components/blog/Pagination.tsx`
- `src/app/(site)/blog/page/[page]/page.tsx`
- `src/app/(site)/blog/category/[cat]/page.tsx`

---

## Task 1: Extend data model + backfill categories

**Files:**
- Modify: `src/lib/blog.ts`

- [ ] **Step 1: Extend the `BlogPost` interface**

In `src/lib/blog.ts`, replace the interface (lines 1-12) with:

```ts
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date, e.g. '2026-07-14'. */
  date: string;
  keywords?: string[];
  /** IDs of tools referenced by this post, rendered as a related-tools rail. */
  relatedTools?: string[];
  /** Markdown body. */
  body: string;
  /** Single primary category, e.g. 'PDF', 'Developer', 'Security', 'Image', 'Text'. */
  category: string;
  /** Freeform tags used for client-side search filtering. */
  tags?: string[];
}
```

- [ ] **Step 2: Backfill `category` (and tags) on all 10 posts**

For each post object in the `posts` array, add a `category` field (and `tags` where obvious). Use this mapping by slug:

| slug | category | tags |
|---|---|---|
| `how-to-merge-pdf-files-free` | `PDF` | `['pdf', 'merge']` |
| `json-formatter-vs-validator` | `Developer` | `['json', 'validation']` |
| `convert-images-to-webp` | `Image` | `['webp', 'image', 'optimization']` |
| `sha256-vs-md5` | `Security` | `['hashing', 'security']` |
| `base64-encoding-explained` | `Developer` | `['base64', 'encoding']` |
| `how-to-minify-css` | `Developer` | `['css', 'minify', 'performance']` |
| `url-encoding-explained` | `Developer` | `['url', 'encoding']` |
| `jwt-tokens-explained` | `Security` | `['jwt', 'auth', 'security']` |

For the remaining 2 posts (run `grep -n "slug:" src/lib/blog.ts` to list all 10), assign category by topic: PDF-related → `PDF`, text/case/word tools → `Text`, image tools → `Image`, security/hash/password → `Security`, everything else developer-oriented → `Developer`. Add a 1-3 item `tags` array matching the post's keywords.

Add the `category` field right after the `date` field in each object so the array stays readable.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors — every post now has required `category`).

- [ ] **Step 4: Commit**

```bash
git add src/lib/blog.ts
git commit -m "feat(blog): add category and tags to BlogPost model"
```

---

## Task 2: Add derived helpers to blog.ts

**Files:**
- Modify: `src/lib/blog.ts`

- [ ] **Step 1: Add helper functions**

Append to `src/lib/blog.ts` (after the existing `getAllPosts` function at line ~563):

```ts
/** Word count of a markdown body (rough — splits on whitespace). */
export function wordCount(body: string): number {
  return body.trim().split(/\s+/).filter(Boolean).length;
}

/** Estimated reading time in minutes (220 wpm, min 1). */
export function readingTime(post: BlogPost): number {
  return Math.max(1, Math.ceil(wordCount(post.body) / 220));
}

/** URL slug for a category name, e.g. 'PDF' -> 'pdf', 'Developer' -> 'developer'. */
export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Resolve a category slug back to its canonical name, or undefined if none match. */
export function categoryFromSlug(slug: string): string | undefined {
  return getAllCategories().find((c) => categorySlug(c.name) === slug)?.name;
}

/** Unique categories with post counts, ordered by count desc then name. */
export function getAllCategories(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
}

/** Posts in a category (by canonical name), newest first. */
export function getPostsByCategory(name: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === name);
}

/** Posts having a tag, newest first. */
export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((p) => p.tags?.includes(tag));
}

/** Slice items for a 1-indexed page. */
export function paginate<T>(
  items: T[],
  page: number,
  perPage = 6,
): { items: T[]; page: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const clamped = Math.min(Math.max(1, page), totalPages);
  const start = (clamped - 1) * perPage;
  return { items: items.slice(start, start + perPage), page: clamped, totalPages };
}
```

Note: `getAllCategories`/`getPostsByCategory` reference the module-level `posts` array and `getAllPosts` — both already exist in the file.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Verify helper output with a scratch script**

Run:
```bash
npx tsx -e "import('./src/lib/blog.ts').then(m => { console.log(m.getAllCategories()); console.log('rt', m.readingTime(m.getAllPosts()[0])); console.log('slug', m.categorySlug('Developer')); })"
```
Expected: prints category list with counts summing to 10, a reading time ≥ 1, and `slug developer`. (If `tsx` unavailable, skip — typecheck + build in later tasks cover correctness.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/blog.ts
git commit -m "feat(blog): add reading time, category, and pagination helpers"
```

---

## Task 3: BlogCard component

**Files:**
- Create: `src/components/blog/BlogCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { readingTime, type BlogPost } from '@/lib/blog';

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
          {post.category}
        </span>
        <span className="tabular-nums">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <span aria-hidden>·</span>
        <span>{readingTime(post)} min read</span>
      </div>
      <h2 className="mt-2 text-xl font-semibold text-foreground">{post.title}</h2>
      <p className="mt-2 text-base leading-7 text-muted-foreground text-pretty">
        {post.description}
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
        Read guide
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/BlogCard.tsx
git commit -m "feat(blog): add reusable BlogCard component"
```

---

## Task 4: BlogHero component

**Files:**
- Create: `src/components/blog/BlogHero.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { readingTime, type BlogPost } from '@/lib/blog';

export default function BlogHero({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border bg-card p-8 transition-colors hover:border-primary/40 sm:p-10"
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
          {post.category}
        </span>
        <span className="tabular-nums">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <span aria-hidden>·</span>
        <span>{readingTime(post)} min read</span>
        <span className="ml-auto hidden font-medium text-primary sm:inline">Latest</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-foreground text-balance sm:text-3xl">
        {post.title}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground text-pretty">
        {post.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
        Read guide
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/BlogHero.tsx
git commit -m "feat(blog): add BlogHero featured-post component"
```

---

## Task 5: CategoryChips component

**Files:**
- Create: `src/components/blog/CategoryChips.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Link from 'next/link';
import { getAllCategories, categorySlug } from '@/lib/blog';

/** `activeCategory` is the canonical name of the current category page, or undefined on the index. */
export default function CategoryChips({ activeCategory }: { activeCategory?: string }) {
  const categories = getAllCategories();
  const base =
    'inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors';
  const active = 'border-primary bg-primary/10 text-primary';
  const idle = 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground';

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/blog" className={`${base} ${activeCategory ? idle : active}`}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.name}
          href={`/blog/category/${categorySlug(c.name)}`}
          className={`${base} ${activeCategory === c.name ? active : idle}`}
        >
          {c.name}
          <span className="ml-1.5 text-xs opacity-70">{c.count}</span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/CategoryChips.tsx
git commit -m "feat(blog): add CategoryChips navigation component"
```

---

## Task 6: Pagination component

**Files:**
- Create: `src/components/blog/Pagination.tsx`

- [ ] **Step 1: Write the component**

`basePath` is the route root (`/blog` or `/blog/category/pdf`). Page 1 links to `basePath`; page N>1 links to `${basePath}/page/N`.

```tsx
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
}

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

export default function Pagination({ basePath, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const link = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition-colors';
  const idle = 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground';
  const active = 'border-primary bg-primary/10 font-medium text-primary';
  const disabled = 'pointer-events-none opacity-40';

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={pageHref(basePath, page - 1)}
        className={`${link} ${idle} ${page <= 1 ? disabled : ''}`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={pageHref(basePath, p)}
          className={`${link} ${p === page ? active : idle}`}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </Link>
      ))}
      <Link
        href={pageHref(basePath, page + 1)}
        className={`${link} ${idle} ${page >= totalPages ? disabled : ''}`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/Pagination.tsx
git commit -m "feat(blog): add numbered Pagination component"
```

---

## Task 7: BlogSearch client component

**Files:**
- Create: `src/components/blog/BlogSearch.tsx`

Search filters the cards currently rendered on the page. It receives the page's posts and renders them, hiding non-matches when a query is active. Because it owns rendering of the grid, page components pass it the post list and it renders `BlogCard`s.

- [ ] **Step 1: Write the client component**

```tsx
'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { BlogPost } from '@/lib/blog';
import BlogCard from './BlogCard';

/**
 * Renders a search box + a grid of BlogCards for the given posts.
 * Filtering is client-side over title/description/tags of the passed posts only.
 * Hero and pagination render OUTSIDE this component in the page, so they are
 * unaffected by the query — search filters only the grid it owns (spec approach A).
 */
export default function BlogSearch({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const haystack = [p.title, p.description, ...(p.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

  return (
    <div>
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search these guides…"
          aria-label="Search guides"
          className="w-full rounded-lg border border-border/60 bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          No guides match “{query}”.
        </p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
```

Note: search filters only the grid it owns. The hero (page 1) and pagination render outside `BlogSearch` in the page component and are unaffected — acceptable per spec approach A (search scoped to current page's grid posts).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/BlogSearch.tsx
git commit -m "feat(blog): add client-side BlogSearch grid component"
```

---

## Task 8: SEO helpers for category + paginated pages

**Files:**
- Modify: `src/lib/seo.ts`

- [ ] **Step 1: Extend imports**

At the top of `src/lib/seo.ts`, the existing import is:
```ts
import { getAllPosts, type BlogPost } from '@/lib/blog';
```
Change it to also import the category helper:
```ts
import { getAllPosts, categorySlug, type BlogPost } from '@/lib/blog';
```

- [ ] **Step 2: Add `articleSection` to `blogPostJsonLd`**

In `blogPostJsonLd` (around line 489-503), add `articleSection` to the `article` object, after `inLanguage`:
```ts
    inLanguage: 'en',
    articleSection: post.category,
```
And merge tags into keywords — change the `keywords` line to:
```ts
    keywords: [...(post.keywords ?? []), ...(post.tags ?? [])].join(', ') || undefined,
```

- [ ] **Step 3: Add category + page metadata helpers**

Append after `blogPostJsonLd` (end of file):

```ts
export function getBlogCategoryMetadata(category: string): Metadata {
  return createMetadata({
    fullTitle: `${category} Guides & How-Tos | ${siteName}`,
    description: `Practical ${category} guides using free, privacy-first browser tools.`,
    path: `/blog/category/${categorySlug(category)}`,
    keywords: [`${category.toLowerCase()} guides`, 'how to', 'free tools tutorials'],
  });
}

export function getBlogPageMetadata(page: number): Metadata {
  return createMetadata({
    fullTitle: `Guides & How-Tos – Page ${page} | ${siteName}`,
    description:
      'Practical guides on PDFs, images, JSON, and everyday web tasks — using free, privacy-first browser tools.',
    path: `/blog/page/${page}`,
    keywords: ['web tools guides', 'how to', 'free tools tutorials'],
  });
}

export function blogCategoryJsonLd(category: string, posts: BlogPost[]) {
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absoluteUrl(`/blog/category/${categorySlug(category)}#collection`),
    url: absoluteUrl(`/blog/category/${categorySlug(category)}`),
    name: `${category} Guides & How-Tos`,
    isPartOf: { '@id': absoluteUrl('/#website') },
    hasPart: posts.map((p) => ({
      '@type': 'Article',
      '@id': absoluteUrl(`/blog/${p.slug}#article`),
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
    })),
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: category, path: `/blog/category/${categorySlug(category)}` },
  ]);
  return [collection, breadcrumb];
}
```

Note: `createMetadata`, `siteName`, `absoluteUrl`, `breadcrumbJsonLd`, and the `Metadata` type are all already defined/imported in `seo.ts`.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo.ts
git commit -m "feat(blog): add SEO metadata + JSON-LD for category and paginated pages"
```

---

## Task 9: Rework blog index (page 1)

**Files:**
- Modify: `src/app/(site)/blog/page.tsx`

Page 1 layout: header · category chips · hero(newest) · search+grid(next 6) · pagination.
Total pages math: page 1 shows hero + 6 grid posts (7 total); later pages show 6 each.

- [ ] **Step 1: Replace the file**

```tsx
import { getAllPosts, paginate } from '@/lib/blog';
import { getBlogIndexMetadata } from '@/lib/seo';
import BlogHero from '@/components/blog/BlogHero';
import BlogSearch from '@/components/blog/BlogSearch';
import CategoryChips from '@/components/blog/CategoryChips';
import Pagination from '@/components/blog/Pagination';

export const metadata = getBlogIndexMetadata();

const PER_PAGE = 6;

export default function BlogIndex() {
  const posts = getAllPosts();
  const hero = posts[0];
  const rest = posts.slice(1);
  const { items: pagePosts } = paginate(rest, 1, PER_PAGE);
  // total pages across hero(1) + rest: page 1 holds hero + PER_PAGE; each later page holds PER_PAGE.
  const totalPages = Math.max(1, 1 + Math.ceil(Math.max(0, rest.length - PER_PAGE) / PER_PAGE));

  return (
    <div className="bg-muted/20">
      <div className="border-b border-border/60 bg-background">
        <div className="container py-10">
          <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">
            Guides &amp; How-Tos
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground text-pretty">
            Practical guides on PDFs, images, JSON, and everyday web tasks — using free,
            privacy-first browser tools.
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="mx-auto max-w-4xl">
          <CategoryChips />
          {hero && (
            <div className="mt-6">
              <BlogHero post={hero} />
            </div>
          )}
          <div className="mt-8">
            <BlogSearch posts={pagePosts} />
          </div>
          <Pagination basePath="/blog" page={1} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Render check**

Run: `npm run dev`, open `http://localhost:3000/blog`.
Expected: header, chip row (All + categories with counts), hero = newest post, search box + grid of next 6 posts, and (since 10 posts → totalPages = 1 + ceil((9-6)/6) = 2) a pagination row showing pages 1 2. Type in search → grid filters; hero + pagination remain.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(site)/blog/page.tsx"
git commit -m "feat(blog): rebuild index with hero, chips, search, pagination"
```

---

## Task 10: Paginated index route `/blog/page/[page]`

**Files:**
- Create: `src/app/(site)/blog/page/[page]/page.tsx`

- [ ] **Step 1: Write the route**

Page N>1 shows grid of PER_PAGE posts from the non-hero list, offset so page 2 starts after page-1's 6 posts. `restIndexStart = (page - 1) * PER_PAGE` into `rest` works because page 1 consumed `rest[0..5]`, page 2 → `rest[6..11]`, etc.

```tsx
import { notFound } from 'next/navigation';
import { getAllPosts } from '@/lib/blog';
import { getBlogPageMetadata } from '@/lib/seo';
import BlogSearch from '@/components/blog/BlogSearch';
import CategoryChips from '@/components/blog/CategoryChips';
import Pagination from '@/components/blog/Pagination';

const PER_PAGE = 6;

function totalPagesFor(restLength: number): number {
  return Math.max(1, 1 + Math.ceil(Math.max(0, restLength - PER_PAGE) / PER_PAGE));
}

export function generateStaticParams() {
  const rest = getAllPosts().slice(1);
  const total = totalPagesFor(rest.length);
  const params: { page: string }[] = [];
  for (let p = 2; p <= total; p++) params.push({ page: String(p) });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return getBlogPageMetadata(Number(page));
}

export default async function BlogPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNum = Number(page);
  if (!Number.isInteger(pageNum) || pageNum < 2) notFound();

  const rest = getAllPosts().slice(1);
  const totalPages = totalPagesFor(rest.length);
  if (pageNum > totalPages) notFound();

  const start = (pageNum - 1) * PER_PAGE;
  const pagePosts = rest.slice(start, start + PER_PAGE);
  if (pagePosts.length === 0) notFound();

  return (
    <div className="bg-muted/20">
      <div className="border-b border-border/60 bg-background">
        <div className="container py-10">
          <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">
            Guides &amp; How-Tos
          </h1>
          <p className="mt-3 text-sm text-muted-foreground tabular-nums">
            Page {pageNum} of {totalPages}
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="mx-auto max-w-4xl">
          <CategoryChips />
          <div className="mt-8">
            <BlogSearch posts={pagePosts} />
          </div>
          <Pagination basePath="/blog" page={pageNum} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Render check**

With `npm run dev`, open `http://localhost:3000/blog/page/2`.
Expected: header "Page 2 of 2", chips, grid of remaining posts (posts 8-10), pagination with 2 active. Open `/blog/page/9` → 404. Open `/blog/page/abc` → 404.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(site)/blog/page/[page]/page.tsx"
git commit -m "feat(blog): add numbered pagination route /blog/page/[page]"
```

---

## Task 11: Category route `/blog/category/[cat]`

**Files:**
- Create: `src/app/(site)/blog/category/[cat]/page.tsx`

Categories have few posts each — no pagination needed within a category unless it exceeds `PER_PAGE`. Include Pagination for correctness (renders nothing when `totalPages <= 1`). For simplicity, category pages are single-page (all posts in category) — Pagination is omitted since counts are small; if a category exceeds ~12 posts later, add `/blog/category/[cat]/page/[page]`. Documented as a known limitation.

- [ ] **Step 1: Write the route**

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import {
  getAllCategories,
  getPostsByCategory,
  categoryFromSlug,
  categorySlug,
} from '@/lib/blog';
import { getBlogCategoryMetadata, blogCategoryJsonLd } from '@/lib/seo';
import BlogSearch from '@/components/blog/BlogSearch';
import CategoryChips from '@/components/blog/CategoryChips';

export function generateStaticParams() {
  return getAllCategories().map((c) => ({ cat: categorySlug(c.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const name = categoryFromSlug(cat);
  if (!name) return {};
  return getBlogCategoryMetadata(name);
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ cat: string }>;
}) {
  const { cat } = await params;
  const name = categoryFromSlug(cat);
  if (!name) notFound();

  const posts = getPostsByCategory(name);
  const jsonLd = blogCategoryJsonLd(name, posts);

  return (
    <>
      {jsonLd.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}

      <div className="bg-muted/20">
        <div className="border-b border-border/60 bg-background">
          <div className="container py-10">
            <nav
              className="mb-5 flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/blog" className="transition-colors hover:text-foreground">
                Blog
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">{name}</span>
            </nav>
            <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">
              {name} Guides &amp; How-Tos
            </h1>
            <p className="mt-3 text-sm text-muted-foreground tabular-nums">
              {posts.length} {posts.length === 1 ? 'guide' : 'guides'}
            </p>
          </div>
        </div>

        <div className="container py-10">
          <div className="mx-auto max-w-4xl">
            <CategoryChips activeCategory={name} />
            <div className="mt-8">
              <BlogSearch posts={posts} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Render check**

With `npm run dev`, open `http://localhost:3000/blog/category/developer`.
Expected: breadcrumb Home › Blog › Developer, heading "Developer Guides & How-Tos", count, active "Developer" chip, grid of only Developer posts. Open `/blog/category/nonexistent` → 404.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(site)/blog/category/[cat]/page.tsx"
git commit -m "feat(blog): add category route /blog/category/[cat]"
```

---

## Task 12: Add category badge + reading time to post detail

**Files:**
- Modify: `src/app/(site)/blog/[slug]/page.tsx`

- [ ] **Step 1: Update imports**

Change line 5:
```ts
import { getAllPosts, getPostBySlug } from '@/lib/blog';
```
to:
```ts
import { getAllPosts, getPostBySlug, readingTime, categorySlug } from '@/lib/blog';
```

- [ ] **Step 2: Replace the date block in the header**

Replace the existing date `<div>` (lines 63-69) with a metadata row including category link + reading time:

```tsx
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Link
                href={`/blog/category/${categorySlug(post.category)}`}
                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {post.category}
              </Link>
              <span className="tabular-nums">
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span aria-hidden>·</span>
              <span>{readingTime(post)} min read</span>
            </div>
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Render check**

With `npm run dev`, open any post, e.g. `http://localhost:3000/blog/sha256-vs-md5`.
Expected: header shows category pill (links to its category page), date, and "N min read". Body, share, related tools unchanged.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)/blog/[slug]/page.tsx"
git commit -m "feat(blog): show category badge and reading time on post detail"
```

---

## Task 13: Full build + lint verification

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: PASS (no new errors). Fix any lint issues introduced (e.g. unused imports).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: PASS. Static params generated for `/blog`, `/blog/page/2`, and `/blog/category/*` (one per category). No errors from `generateStaticParams` / `notFound` usage.

- [ ] **Step 3: Spot-check built routes**

After build, run `npm run start` (or `npm run dev`) and verify:
- `/blog` — hero + 6 cards + pagination (1 2)
- `/blog/page/2` — remaining cards
- `/blog/category/developer` — Developer posts only
- `/blog/security` category chip works from any page
- A post detail shows badge + reading time

- [ ] **Step 4: Commit (if lint fixes were needed)**

```bash
git add -A
git commit -m "chore(blog): lint fixes and build verification"
```

---

## Self-Review Notes

- **Spec coverage:** categories/tags (Tasks 1,2,5,11) ✓; dedicated category pages (Task 11) ✓; search (Task 7, used in 9/10/11) ✓; reading time (Task 2, shown in 3/4/12) ✓; hero (Task 4, used in 9) ✓; numbered pagination (Task 6, routes 9/10) ✓; SEO (Task 8) ✓; detail badge (Task 12) ✓.
- **Known limitation (from spec + Task 11):** category pages are single-page (no intra-category pagination). Acceptable while categories stay small (<~12 posts). Documented.
- **Type consistency:** `categorySlug`/`categoryFromSlug`/`readingTime`/`paginate`/`getAllCategories`/`getPostsByCategory` defined in Task 2, used with identical signatures in Tasks 3-12. `Pagination` props (`basePath`, `page`, `totalPages`) consistent across 6/9/10.
- **Pagination math** identical in Task 9 (index) and Task 10 (`totalPagesFor`): `1 + ceil(max(0, restLen - PER_PAGE)/PER_PAGE)`.
