import Link from 'next/link';
import { ArrowRight, BookOpen, Rss, ShieldCheck } from 'lucide-react';
import {
  BLOG_PER_PAGE,
  blogIndexTotalPages,
  categorySlug,
  getAllCategories,
  getAllPosts,
  paginate,
  toCardData,
} from '@/lib/blog';
import { blogIndexJsonLd, getBlogIndexMetadata } from '@/lib/seo';
import BlogHero from '@/components/blog/BlogHero';
import BlogSearch from '@/components/blog/BlogSearch';
import CategoryChips from '@/components/blog/CategoryChips';
import Pagination from '@/components/blog/Pagination';

export const metadata = getBlogIndexMetadata();

export default function BlogIndex() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const hero = posts[0];
  const rest = posts.slice(1);
  const { items: pagePosts } = paginate(rest, 1, BLOG_PER_PAGE);
  const totalPages = blogIndexTotalPages(rest.length);
  const jsonLdParts = blogIndexJsonLd(posts);

  return (
    <div className="bg-background">
      {jsonLdParts.map((node, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}

      <header className="relative overflow-hidden border-b border-border/70 bg-card/40">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/3 top-0 h-80 w-[34rem] rounded-full bg-primary/12 blur-[110px]" aria-hidden="true" />
        <div className="container relative py-14 sm:py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="eyebrow">FreeWebTools library</p>
              <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-[-0.05em] text-foreground text-balance sm:text-6xl">
                Practical guides for files,
                <br className="hidden sm:block" /> data, and the web.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
                Direct answers, tested steps, and plain explanations for PDFs, JSON,
                images, security, and browser-based developer work.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3.5 py-2 font-medium text-muted-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                {posts.length} published guides
              </span>
              <Link
                href="/feed.xml"
                className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3.5 py-2 font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                <Rss className="h-4 w-4 text-orange-500" />
                RSS feed
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-12 sm:py-16">
        <CategoryChips />

        {hero && (
          <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,.7fr)]">
            <BlogHero post={hero} />
            <aside className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
              <p className="eyebrow">Browse by topic</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                Start with the work in front of you.
              </h2>
              <div className="mt-6 divide-y divide-border/70 border-y border-border/70">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={`/blog/category/${categorySlug(category.name)}`}
                    className="group flex items-center gap-3 py-4 text-sm"
                  >
                    <span className="font-semibold text-foreground">{category.name}</span>
                    <span className="text-muted-foreground">{category.count}</span>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                Each guide links to the exact tool used in its examples.
              </p>
            </aside>
          </section>
        )}

        <section className="mt-16" aria-labelledby="latest-guides">
          <div className="mb-7 max-w-2xl">
            <p className="eyebrow">Latest articles</p>
            <h2 id="latest-guides" className="mt-2 font-serif text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
              Read what you need. Skip the filler.
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Search the library by format, standard, task, or tool.
            </p>
          </div>
          <BlogSearch posts={pagePosts.map(toCardData)} />
          <Pagination basePath="/blog" page={1} totalPages={totalPages} />
        </section>

        <section className="mt-16 rounded-2xl border bg-card/60 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div className="flex max-w-3xl items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-foreground">How this library is written</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                One useful question per article, concrete examples, working internal links,
                and primary sources when a standard or measured claim matters.
              </p>
            </div>
          </div>
          <Link href="/about" className="mt-5 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:mt-0">
            About the project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
