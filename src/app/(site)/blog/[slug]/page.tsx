import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronRight, Home } from 'lucide-react';
import { marked } from 'marked';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { getToolById } from '@/lib/tools';
import { absoluteUrl, blogPostJsonLd, createBlogPostMetadata, toolPath } from '@/lib/seo';
import ShareButtons from '@/components/ShareButtons';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return createBlogPostMetadata(post);
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = marked.parse(post.body, { async: false }) as string;
  const relatedTools = (post.relatedTools || [])
    .map((id) => getToolById(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t && t.status === 'active'));
  const jsonLdParts = blogPostJsonLd(post);

  return (
    <>
      {jsonLdParts.map((node, i) => (
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
            </nav>
            <div className="text-xs text-muted-foreground tabular-nums">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-foreground text-balance sm:text-4xl">
              {post.title}
            </h1>
          </div>
        </div>

        <div className="container py-10">
          <article
            className="blog-content mx-auto max-w-3xl"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mx-auto mt-10 max-w-3xl border-t border-border/60 pt-8">
            <ShareButtons url={absoluteUrl(`/blog/${post.slug}`)} title={post.title} />
          </div>

          {relatedTools.length > 0 && (
            <div className="mx-auto mt-10 max-w-3xl border-t border-border/60 pt-8">
              <h2 className="text-xl font-semibold text-foreground">Tools mentioned</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={toolPath(tool)}
                    className="group flex items-start justify-between gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <div>
                      <div className="font-medium text-foreground">{tool.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{tool.description}</div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
