import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import { categories, getToolsByCategory, getAllActiveTools } from '@/lib/tools';
import { getToolsHubMetadata, toolsHubJsonLd } from '@/lib/seo';

export const metadata = getToolsHubMetadata();

export default function ToolsHubPage() {
  const activeTools = getAllActiveTools();
  const jsonLdParts = toolsHubJsonLd();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      {jsonLdParts.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}

      <div className="border-b border-border/60 bg-background">
        <div className="container py-10">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">All Tools</span>
          </nav>
          <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">
            All free online tools
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground text-pretty">
            The full FreeWebTools directory — {activeTools.length} free utilities across {categories.length} categories.
            Most tools run locally in your browser, with no account or sign-up. Pick a category below or open a tool directly.
          </p>
        </div>
      </div>

      <main className="flex-1 bg-muted/20 py-10">
        <div className="container space-y-12">
          {categories.map((category) => {
            const categoryTools = getToolsByCategory(category.id);
            if (categoryTools.length === 0) return null;
            return (
              <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                      <CategoryIcon categoryId={category.id} className="h-5 w-5" />
                    </span>
                    <h2 id={`cat-${category.id}`} className="text-xl font-semibold text-foreground">
                      <Link href={`/tools/${category.id}`} className="hover:text-primary">
                        {category.name}
                      </Link>
                    </h2>
                  </div>
                  <Link
                    href={`/tools/${category.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.categoryId}/${tool.slug}`}
                      className="group flex flex-col rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
                    >
                      <h3 className="flex items-center justify-between gap-3 font-medium text-foreground">
                        {tool.name}
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground text-pretty">
                        {tool.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
