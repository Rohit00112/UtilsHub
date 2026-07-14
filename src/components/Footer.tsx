import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/15 bg-background">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-xl text-foreground">
              FreeWeb<span className="italic text-primary">Tools</span>
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Free web tools for working with PDFs, images, text,
              code, security values, APIs, and common calculations.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow mb-3">Pages</p>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/about" className="text-foreground/80 hover:text-primary">About</Link></li>
              <li><Link href="/privacy" className="text-foreground/80 hover:text-primary">Privacy</Link></li>
              <li><Link href="/tools" className="text-foreground/80 hover:text-primary">All tools</Link></li>
              <li><Link href="/blog" className="text-foreground/80 hover:text-primary">Blog</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="eyebrow mb-3">Project</p>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="https://github.com/Rohit00112" target="_blank" rel="noreferrer" className="text-foreground/80 hover:text-primary">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="https://github.com/Rohit00112" target="_blank" rel="noreferrer" className="text-foreground/80 hover:text-primary">
                  Built by Rohit
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-foreground/10 pt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {year} FreeWebTools · Open source utility tools</span>
          <span>Local tools run in your browser</span>
        </div>
      </div>
    </footer>
  );
}
