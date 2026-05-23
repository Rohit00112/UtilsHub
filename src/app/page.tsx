import Link from 'next/link';
import { ArrowRight, CheckCircle2, LockKeyhole, Search, ShieldCheck, Zap } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import SearchLauncher from '@/components/SearchLauncher';
import { categories, getAllActiveTools, getToolsByCategory } from '@/lib/tools';
import { createMetadata, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata = createMetadata({});

const commonToolIds = [
    'json-formatter',
    'jwt-decoder',
    'password-generator',
    'pdf-splitter',
    'image-resizer',
    'word-counter',
];

export default function Home() {
    const websiteLd = websiteJsonLd();
    const orgLd = organizationJsonLd();
    const activeTools = getAllActiveTools();
    const commonTools = commonToolIds
        .map((id) => activeTools.find((tool) => tool.id === id))
        .filter(Boolean);

    return (
        <div className="flex flex-col bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
            />

            <section className="border-b border-border/60">
                <div className="container grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-1.5 text-sm text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-foreground" />
                            Browser-local utility tools
                        </div>
                        <h1 className="max-w-3xl text-4xl font-semibold text-foreground text-balance sm:text-5xl">
                            Useful tools for everyday file, text, image, and developer work.
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground text-pretty">
                            UtilsHub keeps common tasks fast and local. Format data, process files, generate secure values, and convert media without uploading your input to a server.
                        </p>
                        <div className="mt-6 max-w-xl">
                            <SearchLauncher label="Search 30+ tools by task or format" className="h-12 px-4" />
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1 rounded-md border bg-muted/20 px-2.5 py-1">
                                <LockKeyhole className="h-3.5 w-3.5" />
                                No uploads
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md border bg-muted/20 px-2.5 py-1">
                                <Zap className="h-3.5 w-3.5" />
                                Instant results
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md border bg-muted/20 px-2.5 py-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Free to use
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b pb-3">
                            <div>
                                <h2 className="font-semibold text-foreground">Common tools</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Start with the utilities people reach for most.</p>
                            </div>
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="mt-3 grid gap-2">
                            {commonTools.map((tool) => tool && (
                                <Link
                                    key={tool.id}
                                    href={`/tools/${tool.categoryId}/${tool.slug}`}
                                    className="group flex items-center gap-3 rounded-md border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-accent"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/20 text-muted-foreground">
                                        <CategoryIcon categoryId={tool.categoryId} className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-medium text-foreground">{tool.name}</span>
                                        <span className="block truncate text-sm text-muted-foreground">{tool.description}</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="tool-directory" className="bg-muted/20 py-12">
                <div className="container">
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground text-balance">Browse by category</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground text-pretty">
                                Each category is organized for quick scanning, with direct links to focused browser-based tools.
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground tabular-nums">{activeTools.length} active tools</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category) => {
                            const categoryTools = getToolsByCategory(category.id);
                            return (
                                <Link
                                    href={`/tools/${category.id}`}
                                    key={category.id}
                                    className="group rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/20 text-muted-foreground">
                                            <CategoryIcon categoryId={category.id} />
                                        </span>
                                        <span className="rounded-md border bg-muted/20 px-2 py-1 text-xs font-medium text-muted-foreground tabular-nums">
                                            {categoryTools.length} tools
                                        </span>
                                    </div>
                                    <h3 className="mt-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                                        {category.name}
                                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground text-pretty">
                                        {category.description}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {categoryTools.slice(0, 3).map((tool) => (
                                            <span key={tool.id} className="rounded-md bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                                                {tool.name}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
