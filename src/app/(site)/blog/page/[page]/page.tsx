import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { BLOG_PER_PAGE, blogIndexTotalPages, getAllPosts, toCardData } from '@/lib/blog';
import { getBlogPageMetadata } from '@/lib/seo';
import BlogSearch from '@/components/blog/BlogSearch';
import CategoryChips from '@/components/blog/CategoryChips';
import Pagination from '@/components/blog/Pagination';

export function generateStaticParams() {
  const total = blogIndexTotalPages(getAllPosts().slice(1).length);
  return Array.from({ length: Math.max(0, total - 1) }, (_, index) => ({ page: String(index + 2) }));
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return getBlogPageMetadata(Number(page));
}

export default async function BlogPaginatedPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const pageNum = Number(page);
  if (!Number.isInteger(pageNum) || pageNum < 2) notFound();

  const rest = getAllPosts().slice(1);
  const totalPages = blogIndexTotalPages(rest.length);
  if (pageNum > totalPages) notFound();

  const start = BLOG_PER_PAGE + (pageNum - 2) * BLOG_PER_PAGE;
  const pagePosts = rest.slice(start, start + BLOG_PER_PAGE);
  if (pagePosts.length === 0) notFound();

  return (
    <div className="bg-background">
      <header className="relative overflow-hidden border-b border-border/70 bg-card/40">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container relative py-12 sm:py-16">
          <nav className="mb-7 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-foreground">Guides</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Page {pageNum}</span>
          </nav>
          <p className="eyebrow">FreeWebTools library</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-foreground text-balance sm:text-5xl">
            More practical guides
          </h1>
          <p className="mt-3 text-sm text-muted-foreground tabular-nums">
            Page {pageNum} of {totalPages}
          </p>
        </div>
      </header>

      <main className="container py-12 sm:py-16">
        <CategoryChips />
        <div className="mt-10">
          <BlogSearch posts={pagePosts.map(toCardData)} />
        </div>
        <Pagination basePath="/blog" page={pageNum} totalPages={totalPages} />
      </main>
    </div>
  );
}
