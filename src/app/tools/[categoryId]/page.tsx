import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowRight } from 'lucide-react';
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
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Category Header */}
      <div className="bg-background border-b border-border/40">
        <div className="container py-16">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{category.icon}</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {category.name}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <main className="flex-1 py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                href={`/tools/${categoryId}/${tool.slug}`}
                key={tool.id}
                className="group relative flex flex-col rounded-xl border bg-card p-8 transition-all hover:shadow-md hover:border-primary/20"
              >
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors flex items-center justify-between">
                  {tool.name}
                  <ArrowRight className="h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-auto pt-6">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Tool
                  </span>
                </div>
              </Link>
            ))}
            
            {/* Future Placeholder */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-all bg-background/50">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 text-2xl">
                ➕
              </div>
              <h3 className="text-lg font-bold mb-1">More Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;re constantly adding new tools to the {category.name} suite.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
