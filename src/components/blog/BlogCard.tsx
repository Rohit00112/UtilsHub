import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { categorySlug, type BlogCardData } from '@/lib/blog';

export default function BlogCard({ post, index }: { post: BlogCardData; index?: number }) {
  return (
    <article className="soft-card group relative flex min-h-72 flex-col overflow-hidden p-6">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/[0.07] blur-2xl" aria-hidden="true" />
      <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
        <Link
          href={`/blog/category/${categorySlug(post.category)}`}
          className="relative z-10 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          {post.category}
        </Link>
        <time dateTime={post.date} className="tabular-nums">
          {new Date(`${post.date}T00:00:00`).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
        {index !== undefined && (
          <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      <Link href={`/blog/${post.slug}`} className="relative mt-6 flex flex-1 flex-col">
        <h2 className="text-xl font-bold leading-snug tracking-[-0.02em] text-foreground text-balance">
          {post.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground text-pretty">
          {post.description}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-7 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {post.readingMinutes} min
          </span>
          {post.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="hidden rounded-full border px-2 py-0.5 sm:inline">
              {tag}
            </span>
          ))}
          <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
