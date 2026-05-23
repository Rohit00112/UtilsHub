'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';
import { cn } from '@/lib/cn';

export default function SearchLauncher({
  className,
  label = 'Search tools...',
  showShortcut = false,
  enableShortcut = false,
}: {
  className?: string;
  label?: string;
  showShortcut?: boolean;
  enableShortcut?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!enableShortcut) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcut]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          className
        )}
      >
        <Search className="mr-2 h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
        {showShortcut && (
          <kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span>⌘</span>K
          </kbd>
        )}
      </button>
      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
