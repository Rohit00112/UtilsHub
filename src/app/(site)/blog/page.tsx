import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';
import { getBlogIndexMetadata } from '@/lib/seo';

export const metadata = getBlogIndexMetadata();

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="bg-muted/20">
      <div className="border-b border-border/60 bg-background">
        <div className="container py-10">
          <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">
            Guides &amp; How-Tos
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground text-pretty">
            Practical guides on PDFs, images, JSON, and everyday web tasks — using free,
            privacy-first browser tools.
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="mx-auto grid max-w-4xl gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="text-xs text-muted-foreground tabular-nums">
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{post.title}</h2>
              <p className="mt-2 text-base leading-7 text-muted-foreground text-pretty">
                {post.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Read guide
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
