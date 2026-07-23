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
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const link = 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors';
  const idle = 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground';
  const active = 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/15';
  const disabled = 'pointer-events-none border-border bg-muted opacity-40';

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Guide pagination">
      {page <= 1 ? (
        <span className={`${link} ${disabled}`} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      ) : (
        <Link href={pageHref(basePath, page - 1)} className={`${link} ${idle}`} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={pageHref(basePath, pageNumber)}
          className={`${link} ${pageNumber === page ? active : idle}`}
          aria-current={pageNumber === page ? 'page' : undefined}
        >
          {pageNumber}
        </Link>
      ))}
      {page >= totalPages ? (
        <span className={`${link} ${disabled}`} aria-disabled="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : (
        <Link href={pageHref(basePath, page + 1)} className={`${link} ${idle}`} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
