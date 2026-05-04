'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getAllActiveTools, Tool } from '@/lib/tools';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // This is handled by the parent, but good to have as backup or for local triggers
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    const allTools = getAllActiveTools();
    const filtered = allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered.slice(0, 8));
  }, [query]);

  const handleSelect = (tool: Tool) => {
    router.push(`/tools/${tool.categoryId}/${tool.slug}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-xl border bg-card shadow-2xl mx-4"
          >
            <div className="flex items-center border-b px-4 py-3">
              <Search className="mr-3 h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools (e.g. 'pdf', 'password')..."
                className="flex h-10 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                onClick={onClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect(tool)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted group-hover:bg-background">
                        <span className="text-lg">🛠️</span>
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-semibold">{tool.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{tool.description}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
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

            <div className="flex items-center justify-between border-t px-4 py-3 text-[10px] text-muted-foreground bg-muted/20">
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
