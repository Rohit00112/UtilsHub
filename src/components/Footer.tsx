import Link from 'next/link';
import { ArrowUpRight, Code2 } from 'lucide-react';
import LogoMark from './LogoMark';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/45">
      <div className="container py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="FreeWebTools home">
              <LogoMark className="h-9 w-9 rounded-xl shadow-sm shadow-primary/15" />
              <span className="text-lg font-bold tracking-[-0.03em] text-foreground">
                FreeWeb<span className="text-primary">Tools</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Free online tools for PDFs, images, text, code, security, APIs, and
              everyday calculations. Most tools work locally in your browser.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              No account. No uploads for local tools.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-sm font-semibold text-foreground">Explore</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/tools" className="text-muted-foreground transition-colors hover:text-primary">All tools</Link></li>
              <li><Link href="/tools/developer" className="text-muted-foreground transition-colors hover:text-primary">Developer tools</Link></li>
              <li><Link href="/tools/pdf" className="text-muted-foreground transition-colors hover:text-primary">PDF tools</Link></li>
              <li><Link href="/tools/image" className="text-muted-foreground transition-colors hover:text-primary">Image tools</Link></li>
              <li><Link href="/blog" className="text-muted-foreground transition-colors hover:text-primary">Guides</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-sm font-semibold text-foreground">Project</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">About</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground transition-colors hover:text-primary">Privacy</Link></li>
              <li>
                <a
                  href="https://github.com/Rohit00112/UtilsHub"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Open source
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} FreeWebTools. Built for useful work.</span>
          <span>Private by design · Fast by default</span>
        </div>
      </div>
    </footer>
  );
}
