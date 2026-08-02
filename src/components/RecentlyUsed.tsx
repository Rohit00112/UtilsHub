'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, History } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import { getAllActiveTools } from '@/lib/tools';
import { clearRecentTools, getRecentToolIds } from '@/lib/toolState';

export default function RecentlyUsed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRecentIds(getRecentToolIds());
  }, []);

  const tools = useMemo(() => {
    if (!mounted || recentIds.length === 0) return [];
    const byId = new Map(getAllActiveTools().map((tool) => [tool.id, tool]));
    return recentIds
      .map((id) => byId.get(id))
      .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));
  }, [mounted, recentIds]);

  if (tools.length === 0) return null;

  return (
    <section className="border-b border-border/70 bg-card/55">
      <div className="container py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <History className="h-4 w-4 text-primary" />
            Recently used
          </div>
          <button
            type="button"
            onClick={() => {
              clearRecentTools();
              setRecentIds([]);
            }}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.categoryId}/${tool.slug}`}
              prefetch={false}
              className="group flex items-center gap-3 rounded-xl border border-transparent bg-background/65 p-3 transition-all hover:border-primary/20 hover:bg-card hover:shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CategoryIcon categoryId={tool.categoryId} className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">{tool.name}</span>
                <span className="block text-xs text-muted-foreground">Open tool</span>
              </span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
