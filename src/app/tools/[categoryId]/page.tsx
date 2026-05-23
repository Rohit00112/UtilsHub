import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronRight, Plus } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import { getCategoryById, getToolsByCategory, categories } from '@/lib/tools';
import { categoryJsonLd, getCategoryMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  return categories.map((category) => ({
    categoryId: category.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  return getCategoryMetadata(categoryId);
}

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const category = getCategoryById(categoryId);
  const tools = getToolsByCategory(categoryId);

  if (!category) {
    notFound();
  }

  const jsonLd = categoryJsonLd(category);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="border-b border-border/60 bg-background">
        <div className="container py-10">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
          
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted/20 text-muted-foreground">
              <CategoryIcon categoryId={category.id} className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">
                {category.name}
              </h1>
              <p className="mt-2 text-base leading-7 text-muted-foreground text-pretty">
                {category.description}
              </p>
            </div>
          </div>
          {category.longDescription && (
            <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground text-pretty">
              {category.longDescription}
            </p>
          )}
        </div>
      </div>

      <main className="flex-1 bg-muted/20 py-10">
        <div className="container">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground">Available tools</h2>
            <span className="rounded-md border bg-background px-2.5 py-1 text-sm text-muted-foreground tabular-nums">{tools.length} tools</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                href={`/tools/${categoryId}/${tool.slug}`}
                key={tool.id}
                className="group flex min-h-40 flex-col rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                <h3 className="flex items-center justify-between gap-3 text-lg font-semibold text-foreground">
                  {tool.name}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground text-pretty">
                  {tool.description}
                </p>
                <div className="mt-auto pt-6">
                  <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    Open {tool.name}
                  </span>
                </div>
              </Link>
            ))}
            
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/60 p-5 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border bg-muted/20 text-muted-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">More coming soon</h3>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                We&apos;re constantly adding new tools to the {category.name} suite.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
