import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
}

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

export default function Pagination({ basePath, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const link = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition-colors';
  const idle = 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground';
  const active = 'border-primary bg-primary/10 font-medium text-primary';
  const disabled = 'pointer-events-none opacity-40';

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={pageHref(basePath, page - 1)}
        className={`${link} ${idle} ${page <= 1 ? disabled : ''}`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={pageHref(basePath, p)}
          className={`${link} ${p === page ? active : idle}`}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </Link>
      ))}
      <Link
        href={pageHref(basePath, page + 1)}
        className={`${link} ${idle} ${page >= totalPages ? disabled : ''}`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
