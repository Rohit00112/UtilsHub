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
