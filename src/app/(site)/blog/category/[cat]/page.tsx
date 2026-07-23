import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import {
  categoryFromSlug,
  categorySlug,
  getAllCategories,
  getPostsByCategory,
  toCardData,
} from '@/lib/blog';
import { blogCategoryJsonLd, getBlogCategoryMetadata } from '@/lib/seo';
import BlogSearch from '@/components/blog/BlogSearch';
import CategoryChips from '@/components/blog/CategoryChips';

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ cat: categorySlug(category.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const name = categoryFromSlug(cat);
  return name ? getBlogCategoryMetadata(name) : {};
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const name = categoryFromSlug(cat);
  if (!name) notFound();

  const posts = getPostsByCategory(name);
  const jsonLd = blogCategoryJsonLd(name, posts);

  return (
    <div className="bg-background">
      {jsonLd.map((node, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}

      <header className="relative overflow-hidden border-b border-border/70 bg-card/40">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/4 top-0 h-72 w-96 rounded-full bg-primary/12 blur-[100px]" aria-hidden="true" />
        <div className="container relative py-12 sm:py-16">
          <nav className="mb-7 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-foreground">Guides</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{name}</span>
          </nav>
          <p className="eyebrow">{posts.length} {posts.length === 1 ? 'article' : 'articles'}</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-foreground text-balance sm:text-6xl">
            {name} guides
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Clear explanations and working examples for {name.toLowerCase()} tasks.
          </p>
        </div>
      </header>

      <main className="container py-12 sm:py-16">
        <CategoryChips activeCategory={name} />
        <div className="mt-10">
          <BlogSearch posts={posts.map(toCardData)} />
        </div>
      </main>
    </div>
  );
}
