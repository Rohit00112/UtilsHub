import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  List,
  UserRound,
  Wrench,
} from 'lucide-react';
import { marked } from 'marked';
import {
  categorySlug,
  getAllPosts,
  getPostBySlug,
  readingTime,
  type BlogPost,
} from '@/lib/blog';
import { getToolById } from '@/lib/tools';
import { absoluteUrl, blogPostJsonLd, createBlogPostMetadata, toolPath } from '@/lib/seo';
import ShareButtons from '@/components/ShareButtons';

interface Params {
  params: Promise<{ slug: string }>;
}

function headingId(text: string) {
  return text
    .replace(/[`*_]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function postHeadings(body: string) {
  return [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => ({
    text: match[1].replace(/[`*_]/g, ''),
    id: headingId(match[1]),
  }));
}

function relatedPosts(post: BlogPost) {
  return getAllPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 2);
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return post ? createBlogPostMetadata(post) : {};
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth, text }) {
    return `<h${depth} id="${headingId(text)}">${this.parser.parseInline(tokens)}</h${depth}>`;
  };

  const html = marked.parse(post.body, { async: false, renderer }) as string;
  const headings = postHeadings(post.body);
  const relatedTools = (post.relatedTools || [])
    .map((id) => getToolById(id))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool && tool.status === 'active'));
  const keepReading = relatedPosts(post);
  const jsonLdParts = blogPostJsonLd(post);

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
        <div className="container relative py-10 sm:py-16">
          <nav className="mb-8 flex min-w-0 items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="transition-colors hover:text-foreground">Guides</Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/blog/category/${categorySlug(post.category)}`}
              className="truncate transition-colors hover:text-foreground"
            >
              {post.category}
            </Link>
          </nav>

          <div className="max-w-5xl">
            <Link
              href={`/blog/category/${categorySlug(post.category)}`}
              className="inline-flex rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              {post.category}
            </Link>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.06] tracking-[-0.045em] text-foreground text-balance sm:text-6xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground text-pretty">
              {post.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <Link href="/about" className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary">
                <UserRound className="h-4 w-4 text-primary" />
                By FreeWebTools editorial team
              </Link>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Published <time dateTime={post.date}>{formatDate(post.date)}</time>
              </span>
              {post.updatedDate && post.updatedDate !== post.date && (
                <span>
                  Updated <time dateTime={post.updatedDate}>{formatDate(post.updatedDate)}</time>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                {readingTime(post)} min read
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="min-w-0">
            <article
              className="blog-content rounded-[1.5rem] border bg-card p-6 shadow-sm sm:p-10 lg:p-12"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <div className="mt-8 rounded-2xl border bg-card p-5 sm:p-6">
              <ShareButtons url={absoluteUrl(`/blog/${post.slug}`)} title={post.title} />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            {headings.length > 0 && (
              <nav className="rounded-2xl border bg-card p-5 shadow-sm" aria-label="On this page">
                <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <List className="h-4 w-4 text-primary" />
                  On this page
                </h2>
                <ol className="mt-4 space-y-2.5 border-l border-border pl-4 text-sm">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <a href={`#${heading.id}`} className="leading-5 text-muted-foreground transition-colors hover:text-primary">
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {relatedTools.length > 0 && (
              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Wrench className="h-4 w-4 text-primary" />
                  Tools in this guide
                </h2>
                <div className="mt-4 space-y-2">
                  {relatedTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={toolPath(tool)}
                      className="group flex items-center gap-2 rounded-xl border border-transparent bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/20 hover:bg-primary/[0.05]"
                    >
                      <span className="truncate">{tool.name}</span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>

        {keepReading.length > 0 && (
          <section className="mt-14 border-t border-border/70 pt-10" aria-labelledby="keep-reading">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 id="keep-reading" className="text-2xl font-bold tracking-tight text-foreground">
                Keep reading
              </h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {keepReading.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="soft-card group p-6">
                  <span className="text-xs font-semibold text-primary">{related.category}</span>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-foreground">{related.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{related.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    Read guide
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
