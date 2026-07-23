import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clock3 } from 'lucide-react';
import { categorySlug, readingTime, type BlogPost } from '@/lib/blog';

export default function BlogHero({ post }: { post: BlogPost }) {
  return (
    <article className="group relative min-h-[28rem] overflow-hidden rounded-[1.75rem] border bg-slate-950 text-white shadow-xl shadow-primary/10 dark:bg-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,.5),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,.25),transparent_35%)]" aria-hidden="true" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      <div className="relative flex h-full min-h-[28rem] flex-col p-7 sm:p-10">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-semibold text-indigo-200">
            <BookOpen className="h-3.5 w-3.5" />
            Featured guide
          </span>
          <Link
            href={`/blog/category/${categorySlug(post.category)}`}
            className="relative z-10 rounded-full border border-white/15 px-3 py-1.5 font-medium transition-colors hover:bg-white/10"
          >
            {post.category}
          </Link>
        </div>

        <div className="my-auto max-w-3xl py-12">
          <Link href={`/blog/${post.slug}`} className="block">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.04em] text-balance sm:text-5xl">
              {post.title}
            </h2>
          </Link>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 text-pretty sm:text-lg">
            {post.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-5 text-xs text-slate-300">
          <time dateTime={post.date}>
            {new Date(`${post.date}T00:00:00`).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {readingTime(post)} min read
          </span>
          <Link href={`/blog/${post.slug}`} className="ml-auto inline-flex items-center gap-1.5 font-semibold text-white">
            Read the guide
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
