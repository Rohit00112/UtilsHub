'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { BlogCardData } from '@/lib/blog';
import BlogCard from './BlogCard';

export default function BlogSearch({ posts }: { posts: BlogCardData[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) =>
      [post.title, post.description, post.category, ...(post.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [posts, query]);

  return (
    <div>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by topic or task"
            aria-label="Search guides"
            className="h-11 w-full rounded-xl border border-border bg-card py-2 pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'guide' : 'guides'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="font-semibold text-foreground">No guide matches “{query}”.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a format such as PDF, JSON, JWT, CSS, or WebP.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
