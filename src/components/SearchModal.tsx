'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CategoryIcon } from './CategoryIcon';
import { getAllActiveTools, getCategoryById, Tool } from '@/lib/tools';
import { cn } from '@/lib/cn';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const allTools = useMemo(() => getAllActiveTools(), []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return allTools
        .filter((tool) => ['json-formatter', 'jwt-decoder', 'password-generator', 'pdf-splitter', 'image-resizer', 'word-counter'].includes(tool.id))
        .slice(0, 6);
    }

    return allTools
      .filter(
        (tool) =>
          tool.name.toLowerCase().includes(normalizedQuery) ||
          tool.description.toLowerCase().includes(normalizedQuery) ||
          getCategoryById(tool.categoryId)?.name.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 8);
  }, [allTools, query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (tool: Tool) => {
    router.push(`/tools/${tool.categoryId}/${tool.slug}`);
    onClose();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }

    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      handleSelect(results[activeIndex]);
    }
  };

  return (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[max(5rem,12vh)]">
          <button
            type="button"
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Close search"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search tools"
            className="relative w-full max-w-2xl overflow-hidden rounded-lg border bg-card shadow-lg"
          >
            <div className="flex items-center border-b px-4 py-3">
              <Search className="mr-3 h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search by tool, task, or category"
                className="flex h-10 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {!query.trim() && (
                    <p className="px-3 py-2 text-xs font-medium text-muted-foreground">Common tools</p>
                  )}
                  {results.map((tool, index) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => handleSelect(tool)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                        activeIndex === index && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background text-muted-foreground">
                        <CategoryIcon categoryId={tool.categoryId} className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-semibold">{tool.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{tool.description}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="py-14 text-center">
                  <p className="text-sm text-muted-foreground">No tools found matching your search.</p>
                </div>
              ) : (
                <div className="py-14 text-center">
                  <p className="text-sm text-muted-foreground">Start typing to find a tool...</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-background px-1">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-background px-1">↵</kbd> to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1">esc</kbd> to close
              </span>
            </div>
          </div>
        </div>
  );
}
