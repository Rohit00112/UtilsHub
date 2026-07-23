import Link from 'next/link';
import { ArrowRight, ChevronRight, LayoutGrid, LockKeyhole, Search } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import SearchLauncher from '@/components/SearchLauncher';
import { categories, getToolsByCategory, getAllActiveTools } from '@/lib/tools';
import { getToolsHubMetadata, toolsHubJsonLd } from '@/lib/seo';

export const metadata = getToolsHubMetadata();

export default function ToolsHubPage() {
  const activeTools = getAllActiveTools();
  const jsonLdParts = toolsHubJsonLd();

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {jsonLdParts.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}

      <div className="relative overflow-hidden border-b border-border/70 bg-card/40">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/3 top-0 h-72 w-96 rounded-full bg-primary/12 blur-[100px]" aria-hidden="true" />
        <div className="container relative py-12 sm:py-16">
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">All Tools</span>
          </nav>
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <p className="eyebrow">Complete directory</p>
              <h1 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-foreground text-balance sm:text-6xl">
                All free online tools
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground text-pretty">
                Browse {activeTools.length} free browser utilities across {categories.length} focused categories.
                Most tools work locally on your device, with no account, upload queue, or sign-up.
              </p>
            </div>
            <SearchLauncher
              label={`Search all ${activeTools.length} tools`}
              className="h-12 border-primary/20 bg-card px-4 shadow-lg shadow-primary/5"
              showShortcut
              enableShortcut
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5">
              <LayoutGrid className="h-3.5 w-3.5 text-primary" />
              {categories.length} categories
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5">
              <LockKeyhole className="h-3.5 w-3.5 text-emerald-500" />
              Local processing where possible
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-cyan-500" />
              Search by task or format
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 py-14 sm:py-16">
        <div className="container space-y-16">
          {categories.map((category) => {
            const categoryTools = getToolsByCategory(category.id);
            if (categoryTools.length === 0) return null;
            return (
              <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CategoryIcon categoryId={category.id} className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 id={`cat-${category.id}`} className="text-xl font-bold tracking-tight text-foreground">
                        <Link href={`/tools/${category.id}`} className="hover:text-primary">
                          {category.name}
                        </Link>
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">{categoryTools.length} available tools</p>
                    </div>
                  </div>
                  <Link
                    href={`/tools/${category.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.categoryId}/${tool.slug}`}
                      className="soft-card group flex min-h-36 flex-col p-5"
                    >
                      <h3 className="flex items-center justify-between gap-3 font-semibold text-foreground">
                        {tool.name}
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground text-pretty">
                        {tool.description}
                      </p>
                      <span className="mt-auto pt-5 text-xs font-semibold text-primary">Open free tool</span>
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
