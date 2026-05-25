'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import SearchLauncher from './SearchLauncher';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-foreground/15 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-14 items-center gap-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-2xl leading-none tracking-tight text-foreground">
            Utils<span className="italic text-primary">Hub</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
            est. local
          </span>
        </Link>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          <div className="w-full max-w-xs">
            <SearchLauncher className="h-9" showShortcut enableShortcut />
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Toggle theme"
          >
            {mounted && (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </button>
        </div>
      </div>
    </nav>
  );
}
