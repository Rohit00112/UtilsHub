import { notFound } from 'next/navigation';
import { getAllPosts, toCardData, BLOG_PER_PAGE, blogIndexTotalPages } from '@/lib/blog';
import { getBlogPageMetadata } from '@/lib/seo';
import BlogSearch from '@/components/blog/BlogSearch';
import CategoryChips from '@/components/blog/CategoryChips';
import Pagination from '@/components/blog/Pagination';

export function generateStaticParams() {
  const rest = getAllPosts().slice(1);
  const total = blogIndexTotalPages(rest.length);
  const params: { page: string }[] = [];
  for (let p = 2; p <= total; p++) params.push({ page: String(p) });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return getBlogPageMetadata(Number(page));
}

export default async function BlogPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNum = Number(page);
  if (!Number.isInteger(pageNum) || pageNum < 2) notFound();

  const rest = getAllPosts().slice(1);
  const totalPages = blogIndexTotalPages(rest.length);
  if (pageNum > totalPages) notFound();

  const start = (pageNum - 1) * BLOG_PER_PAGE;
  const pagePosts = rest.slice(start, start + BLOG_PER_PAGE);
  if (pagePosts.length === 0) notFound();

  return (
    <div className="bg-muted/20">
      <div className="border-b border-border/60 bg-background">
        <div className="container py-10">
          <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">
            Guides &amp; How-Tos
          </h1>
          <p className="mt-3 text-sm text-muted-foreground tabular-nums">
            Page {pageNum} of {totalPages}
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="mx-auto max-w-4xl">
          <CategoryChips />
          <div className="mt-8">
            <BlogSearch posts={pagePosts.map(toCardData)} />
          </div>
          <Pagination basePath="/blog" page={pageNum} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
