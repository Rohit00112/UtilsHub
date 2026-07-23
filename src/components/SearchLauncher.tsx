'use client';

import { Search } from 'lucide-react';
import { useSearch } from './SearchProvider';
import { cn } from '@/lib/cn';

export default function SearchLauncher({
  className,
  label = 'Search tools...',
  showShortcut = false,
}: {
  className?: string;
  label?: string;
  showShortcut?: boolean;
  enableShortcut?: boolean;
}) {
  const { open } = useSearch();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      className={cn(
        'inline-flex h-10 w-full items-center justify-start rounded-xl border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        className
      )}
    >
      <Search className="mr-2 h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
      {showShortcut && (
        <kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-1 rounded-md border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span>⌘</span>K
        </kbd>
      )}
    </button>
  );
}
