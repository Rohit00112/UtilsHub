'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import SearchModal from './SearchModal';

interface SearchContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}

export default function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SearchContext.Provider value={{ open, close, isOpen }}>
      {children}
      <SearchModal isOpen={isOpen} onClose={close} />
    </SearchContext.Provider>
  );
}
