import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronRight, HelpCircle, ShieldCheck } from 'lucide-react';
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

  if (!category) notFound();

  const jsonLdParts = categoryJsonLd(category);

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
        <div className="pointer-events-none absolute left-1/4 top-0 h-72 w-96 rounded-full bg-primary/12 blur-[100px]" aria-hidden="true" />
        <div className="container relative py-12 sm:py-16">
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/tools" className="transition-colors hover:text-foreground">Tools</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{category.name}</span>
          </nav>

          <div className="flex items-start gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <CategoryIcon categoryId={category.id} className="h-7 w-7" />
            </span>
            <div>
              <p className="eyebrow">{tools.length} free browser tools</p>
              <h1 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em] text-foreground text-balance sm:text-6xl">
                Free {category.name.toLowerCase()} online
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground text-pretty">
                {category.description}
              </p>
            </div>
          </div>
          {category.longDescription && (
            <p className="mt-7 max-w-3xl text-base leading-7 text-muted-foreground text-pretty">
              {category.longDescription}
            </p>
          )}
        </div>
      </div>

      <main className="flex-1 py-14 sm:py-16">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Choose a tool</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                Available {category.name.toLowerCase()}
              </h2>
            </div>
            <span className="rounded-full border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground tabular-nums">
              {tools.length} tools
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                href={`/tools/${categoryId}/${tool.slug}`}
                key={tool.id}
                className="soft-card group flex min-h-44 flex-col p-5"
              >
                <h3 className="flex items-center justify-between gap-3 text-lg font-semibold text-foreground">
                  {tool.name}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground text-pretty">
                  {tool.description}
                </p>
                <div className="mt-auto pt-6">
                  <span className="text-sm font-semibold text-primary">Open {tool.name}</span>
                </div>
              </Link>
            ))}

            <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-primary/[0.035] p-5 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Review before you run</h3>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                Each page explains its input, output, limits, and whether processing stays local.
              </p>
            </div>
          </div>

          {category.faqs && category.faqs.length > 0 && (
            <div className="mx-auto mt-16 max-w-3xl border-t border-border/70 pt-12">
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                <HelpCircle className="h-5 w-5 text-primary" />
                Frequently asked questions
              </h2>
              <div className="mt-5 divide-y divide-border/70 overflow-hidden rounded-2xl border bg-card shadow-sm">
                {category.faqs.map((faq, i) => (
                  <details key={i} className="group p-5 sm:p-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                      {faq.q}
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-normal text-muted-foreground transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-base leading-7 text-muted-foreground text-pretty">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
