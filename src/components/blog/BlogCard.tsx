import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { type BlogCardData } from '@/lib/blog';

export default function BlogCard({ post }: { post: BlogCardData }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
          {post.category}
        </span>
        <span className="tabular-nums">
          {new Date(`${post.date}T00:00:00`).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <span aria-hidden>·</span>
        <span>{post.readingMinutes} min read</span>
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
  );
}
