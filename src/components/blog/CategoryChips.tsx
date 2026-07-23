import Link from 'next/link';
import { categorySlug, getAllCategories } from '@/lib/blog';

export default function CategoryChips({ activeCategory }: { activeCategory?: string }) {
  const categories = getAllCategories();
  const base = 'inline-flex h-10 items-center rounded-xl border px-3.5 text-sm font-medium transition-all';
  const active = 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/15';
  const idle = 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground';

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Guide topics">
      <Link href="/blog" className={`${base} ${activeCategory ? idle : active}`}>
        All topics
        <span className="ml-2 text-xs opacity-75">{categories.reduce((sum, category) => sum + category.count, 0)}</span>
      </Link>
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/blog/category/${categorySlug(category.name)}`}
          className={`${base} ${activeCategory === category.name ? active : idle}`}
        >
          {category.name}
          <span className="ml-2 text-xs opacity-70">{category.count}</span>
        </Link>
      ))}
    </nav>
  );
}
