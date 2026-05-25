import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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

    const issueDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

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

            {/* Masthead */}
            <section className="border-b border-foreground/15">
                <div className="container py-3">
                    <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        <span>Vol. 01 — Local-first utilities</span>
                        <span className="hidden sm:inline">{issueDate}</span>
                        <span>{activeTools.length} tools in print</span>
                    </div>
                </div>
            </section>

            {/* Hero — asymmetric editorial */}
            <section className="border-b border-foreground/15">
                <div className="container grid gap-8 py-12 md:grid-cols-12 md:py-20">
                    <div className="md:col-span-8">
                        <p className="eyebrow mb-6">No. 01 · The Workshop</p>
                        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
                            Quiet tools<br />
                            for <em className="italic text-primary">noisy</em> work.
                        </h1>
                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <p className="text-base leading-relaxed text-foreground/80">
                                UtilsHub is a small workshop of {activeTools.length} browser-local utilities — for files, text, images, and developer chores. Nothing leaves your machine. Nothing waits on a server.
                            </p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Format JSON. Split a PDF. Resize an image. Generate a strong password. The kind of jobs you reach for between meetings, finished in the time it takes to switch tabs.
                            </p>
                        </div>

                        <div className="mt-10 max-w-xl">
                            <SearchLauncher label="Search 30+ tools by task or format" className="h-12 px-4" />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            <span>· No uploads</span>
                            <span>· Instant results</span>
                            <span>· Free to use</span>
                            <span>· Open in browser</span>
                        </div>
                    </div>

                    {/* Side panel — table of contents */}
                    <aside className="md:col-span-4">
                        <div className="border border-foreground/20 bg-card">
                            <div className="border-b border-foreground/20 px-5 py-3">
                                <p className="eyebrow">Inside this issue</p>
                            </div>
                            <ol className="divide-y divide-foreground/10">
                                {commonTools.map((tool, i) => tool && (
                                    <li key={tool.id}>
                                        <Link
                                            href={`/tools/${tool.categoryId}/${tool.slug}`}
                                            className="group flex items-baseline gap-3 px-5 py-3 transition-colors hover:bg-secondary"
                                        >
                                            <span className="marker-num shrink-0 w-6 text-right">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="flex-1 truncate text-sm text-foreground group-hover:text-primary">
                                                {tool.name}
                                            </span>
                                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Most-reached-for, in order of habit.
                        </p>
                    </aside>
                </div>
            </section>

            {/* Sections — categories as newspaper sections */}
            <section id="tool-directory" className="bg-background">
                <div className="container py-16">
                    <div className="mb-10 flex flex-col items-baseline justify-between gap-2 md:flex-row">
                        <div>
                            <p className="eyebrow mb-2">The sections</p>
                            <h2 className="font-serif text-3xl text-foreground sm:text-4xl">Browse the desk.</h2>
                        </div>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {activeTools.length} pieces · {categories.length} departments
                        </p>
                    </div>

                    <div className="rule-thick" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category, idx) => {
                            const categoryTools = getToolsByCategory(category.id);
                            return (
                                <Link
                                    href={`/tools/${category.id}`}
                                    key={category.id}
                                    className="group relative flex flex-col border-b border-r border-foreground/15 p-6 transition-colors hover:bg-secondary md:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r-0"
                                >
                                    <div className="mb-6 flex items-start justify-between">
                                        <span className="marker-num">№ {String(idx + 1).padStart(2, '0')}</span>
                                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                                            {categoryTools.length} {categoryTools.length === 1 ? 'tool' : 'tools'}
                                        </span>
                                    </div>

                                    <CategoryIcon categoryId={category.id} className="mb-4 h-7 w-7 text-foreground" />

                                    <h3 className="font-serif text-2xl leading-tight text-foreground">
                                        {category.name}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {category.description}
                                    </p>

                                    <ul className="mt-5 space-y-1 font-mono text-xs text-muted-foreground">
                                        {categoryTools.slice(0, 3).map((tool) => (
                                            <li key={tool.id} className="truncate">
                                                — {tool.name}
                                            </li>
                                        ))}
                                        {categoryTools.length > 3 && (
                                            <li className="text-foreground/40">+ {categoryTools.length - 3} more</li>
                                        )}
                                    </ul>

                                    <span className="mt-6 inline-flex items-center gap-1 self-start border-b border-foreground/30 pb-0.5 text-xs font-medium uppercase tracking-wider text-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                                        Open section
                                        <ArrowUpRight className="h-3 w-3" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Colophon */}
            <section className="border-t border-foreground/15 bg-secondary/40">
                <div className="container grid gap-8 py-12 md:grid-cols-12">
                    <div className="md:col-span-4">
                        <p className="eyebrow mb-3">Colophon</p>
                        <h3 className="font-serif text-2xl text-foreground">House rules.</h3>
                    </div>
                    <div className="grid gap-8 md:col-span-8 md:grid-cols-3">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider text-primary">01 · Local</p>
                            <p className="mt-2 text-sm text-foreground/80">
                                Everything runs in your browser. Files never touch our servers.
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider text-primary">02 · Fast</p>
                            <p className="mt-2 text-sm text-foreground/80">
                                No splash screens, no sign-ups, no waiting room. Open and use.
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider text-primary">03 · Free</p>
                            <p className="mt-2 text-sm text-foreground/80">
                                No tier walls, no quota meters. The tools you came for, all of them.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
