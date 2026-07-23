'use client';

import Link from 'next/link';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import LogoMark from './LogoMark';
import SearchLauncher from './SearchLauncher';

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="FreeWebTools home">
          <LogoMark className="h-8 w-8 rounded-[10px] shadow-md shadow-primary/15 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105" priority />
          <span className="text-[17px] font-bold tracking-[-0.03em] text-foreground">
            FreeWeb<span className="text-primary">Tools</span>
          </span>
        </Link>

        <div className="ml-3 hidden items-center gap-1 lg:flex">
          <Link
            href="/tools"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            All tools
          </Link>
          <Link
            href="/blog"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Guides
          </Link>
          <Link
            href="/about"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            About
          </Link>
        </div>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
          <div className="hidden w-full max-w-xs sm:block">
            <SearchLauncher label="Search 60+ tools..." className="h-10 bg-card/80" showShortcut enableShortcut />
          </div>
          <div className="w-10 sm:hidden">
            <SearchLauncher
              label="Search tools"
              className="h-10 w-10 justify-center px-0 [&>svg]:mr-0 [&>span]:hidden"
              enableShortcut
            />
          </div>
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </button>
          <Link href="/tools" className="btn btn-primary hidden h-10 gap-1.5 px-4 sm:inline-flex">
            Explore tools
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
