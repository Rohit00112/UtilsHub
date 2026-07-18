import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { readingTime, type BlogPost } from '@/lib/blog';

export default function BlogHero({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border bg-card p-8 transition-colors hover:border-primary/40 sm:p-10"
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
          {post.category}
        </span>
        <span className="tabular-nums">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <span aria-hidden>·</span>
        <span>{readingTime(post)} min read</span>
        <span className="ml-auto hidden font-medium text-primary sm:inline">Latest</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-foreground text-balance sm:text-3xl">
        {post.title}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground text-pretty">
        {post.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
        Read guide
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
