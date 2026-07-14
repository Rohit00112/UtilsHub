import Link from 'next/link';
import { ArrowRight, Home, Wrench } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-dvh dotted-bg">
      <div className="container py-14 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card/90 p-8 shadow-sm sm:p-12">
          <p className="eyebrow">Error 404</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-balance text-foreground sm:text-5xl">
            This page wandered off the map.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            The link might be outdated, the page may have moved, or it never existed in the first place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary gap-2">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
            <Link href="/tools" className="btn btn-secondary gap-2">
              <Wrench className="h-4 w-4" />
              Browse tools
            </Link>
          </div>

          <div className="rule mt-10 pt-5">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Explore latest guides
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}