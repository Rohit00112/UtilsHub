import Link from 'next/link';
import { getAllCategories, categorySlug } from '@/lib/blog';

/** `activeCategory` is the canonical name of the current category page, or undefined on the index. */
export default function CategoryChips({ activeCategory }: { activeCategory?: string }) {
  const categories = getAllCategories();
  const base =
    'inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors';
  const active = 'border-primary bg-primary/10 text-primary';
  const idle = 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground';

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/blog" className={`${base} ${activeCategory ? idle : active}`}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.name}
          href={`/blog/category/${categorySlug(c.name)}`}
          className={`${base} ${activeCategory === c.name ? active : idle}`}
        >
          {c.name}
          <span className="ml-1.5 text-xs opacity-70">{c.count}</span>
        </Link>
      ))}
    </div>
  );
}
