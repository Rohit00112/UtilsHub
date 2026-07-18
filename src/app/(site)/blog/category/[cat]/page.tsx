import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import {
  getAllCategories,
  getPostsByCategory,
  categoryFromSlug,
  categorySlug,
  toCardData,
} from '@/lib/blog';
import { getBlogCategoryMetadata, blogCategoryJsonLd } from '@/lib/seo';
import BlogSearch from '@/components/blog/BlogSearch';
import CategoryChips from '@/components/blog/CategoryChips';

export function generateStaticParams() {
  return getAllCategories().map((c) => ({ cat: categorySlug(c.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const name = categoryFromSlug(cat);
  if (!name) return {};
  return getBlogCategoryMetadata(name);
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ cat: string }>;
}) {
  const { cat } = await params;
  const name = categoryFromSlug(cat);
  if (!name) notFound();

  const posts = getPostsByCategory(name);
  const jsonLd = blogCategoryJsonLd(name, posts);

  return (
    <>
      {jsonLd.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}

      <div className="bg-muted/20">
        <div className="border-b border-border/60 bg-background">
          <div className="container py-10">
            <nav
              className="mb-5 flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/blog" className="transition-colors hover:text-foreground">
                Blog
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">{name}</span>
            </nav>
            <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">
              {name} Guides &amp; How-Tos
            </h1>
            <p className="mt-3 text-sm text-muted-foreground tabular-nums">
              {posts.length} {posts.length === 1 ? 'guide' : 'guides'}
            </p>
          </div>
        </div>

        <div className="container py-10">
          <div className="mx-auto max-w-4xl">
            <CategoryChips activeCategory={name} />
            <div className="mt-8">
              <BlogSearch posts={posts.map(toCardData)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
