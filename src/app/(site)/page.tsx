import Link from 'next/link';
import { ArrowUpRight, Share2 } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import SearchLauncher from '@/components/SearchLauncher';
import { categories, getAllActiveTools, getToolsByCategory } from '@/lib/tools';
import { absoluteUrl, getHomeMetadata, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata = getHomeMetadata();

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
    const shareUrl = encodeURIComponent(absoluteUrl('/'));
    const shareText = encodeURIComponent('FreeWebTools - free online web tools');

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
                        <span>Local-first browser utilities</span>
                        <span className="hidden sm:inline">{issueDate}</span>
                        <span>{activeTools.length} working tools</span>
                    </div>
                </div>
            </section>

            {/* Hero */}
            <section className="border-b border-foreground/15">
                <div className="container grid gap-8 py-12 md:grid-cols-12 md:py-20">
                    <div className="md:col-span-8">
                        <p className="eyebrow mb-6">Free web tools for daily work</p>
                        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
                            60+ free online web tools<br />
                            for PDFs, images, text, and code.
                        </h1>
                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <p className="text-base leading-relaxed text-foreground/80">
                                FreeWebTools collects {activeTools.length} focused online utilities for
                                everyday tasks: formatting JSON, splitting PDFs, resizing images,
                                decoding tokens, building campaign URLs, and checking calculations.
                            </p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Most tools run on your device after the page loads. Pasted drafts,
                                documents, screenshots, passwords, and tokens are not uploaded to a
                                FreeWebTools processing server.
                            </p>
                        </div>

                        <div className="mt-10 max-w-xl">
                            <SearchLauncher label={`Search ${activeTools.length}+ tools by task or format`} className="h-12 px-4" />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            <span>Local tools stay in browser</span>
                            <span>No account</span>
                            <span>Open source</span>
                            <span>Works in browser</span>
                        </div>
                    </div>

                    {/* Common tasks */}
                    <aside className="md:col-span-4">
                        <div className="border border-foreground/20 bg-card">
                            <div className="border-b border-foreground/20 px-5 py-3">
                                <p className="eyebrow">Start with a common task</p>
                            </div>
                            <ol className="divide-y divide-foreground/10">
                                {commonTools.map((tool, i) => tool && (
                                    <li key={tool.id}>
                                        <Link
                                            href={`/tools/${tool.categoryId}/${tool.slug}`}
                                            prefetch={false}
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
                            Frequently used utilities, selected from the active tool list.
                        </p>
                    </aside>
                </div>
            </section>

            {/* Tool categories */}
            <section id="tool-directory" className="bg-background">
                <div className="container py-16">
                    <div className="mb-10 flex flex-col items-baseline justify-between gap-2 md:flex-row">
                        <div>
                            <p className="eyebrow mb-2">Tool directory</p>
                            <h2 className="font-serif text-3xl text-foreground sm:text-4xl">Browse by category.</h2>
                        </div>
                        <Link
                            href="/tools"
                            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                        >
                            {activeTools.length} tools · {categories.length} categories
                            <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="rule-thick" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category, idx) => {
                            const categoryTools = getToolsByCategory(category.id);
                            return (
                                <article
                                    key={category.id}
                                    className="group relative flex flex-col border-b border-r border-foreground/15 p-6 transition-colors hover:bg-secondary md:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r-0"
                                >
                                    <div className="mb-6 flex items-start justify-between">
                                        <span className="marker-num">No. {String(idx + 1).padStart(2, '0')}</span>
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
                                                - {tool.name}
                                            </li>
                                        ))}
                                        {categoryTools.length > 3 && (
                                            <li className="text-muted-foreground">+ {categoryTools.length - 3} more</li>
                                        )}
                                    </ul>

                                    <Link
                                        href={`/tools/${category.id}`}
                                        className="mt-6 inline-flex items-center gap-1 self-start border-b border-foreground/30 pb-0.5 text-xs font-medium uppercase tracking-wider text-foreground transition-colors group-hover:border-primary group-hover:text-primary"
                                    >
                                        Browse {category.name}
                                        <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="border-t border-foreground/15 bg-secondary/20">
                <div className="container grid gap-8 py-12 md:grid-cols-12">
                    <div className="md:col-span-4">
                        <p className="eyebrow mb-3">Why FreeWebTools</p>
                        <h2 className="font-serif text-3xl text-foreground">
                            Useful online tools with clear boundaries.
                        </h2>
                    </div>
                    <div className="space-y-5 text-base leading-7 text-foreground/80 md:col-span-8">
                        <p>
                            FreeWebTools brings free PDF, text, image, calculator, security, web, API, and
                            developer tools into one searchable directory. Use the{' '}
                            <Link href="/tools/developer/json-formatter" className="font-medium text-foreground underline underline-offset-4">
                                JSON formatter
                            </Link>
                            ,{' '}
                            <Link href="/tools/pdf/merger" className="font-medium text-foreground underline underline-offset-4">
                                PDF merger
                            </Link>
                            ,{' '}
                            <Link href="/tools/image/resizer" className="font-medium text-foreground underline underline-offset-4">
                                image resizer
                            </Link>
                            , and dozens of other focused utilities directly in your browser.
                        </p>
                        <p>
                            Each tool page describes what the tool accepts, what it returns, and where
                            the processing happens. Local tools process input in the browser. Network
                            tools, such as the API request tester or WebSocket tester, connect directly
                            from your browser to the destination you choose.
                        </p>
                    </div>
                </div>
            </section>

            <section className="border-t border-foreground/15 bg-background">
                <div className="container py-14">
                    <div className="max-w-3xl">
                        <p className="eyebrow mb-3">Built around specific jobs</p>
                        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
                            One page for each task, with the details on the page.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-foreground/80">
                            FreeWebTools is organized around tasks people can finish in a few minutes:
                            cleaning malformed data, checking a token, preparing a document, converting
                            an image, or calculating a value. Each page keeps the interactive tool at
                            the top and adds plain-language notes below it, including common use cases,
                            basic steps, privacy notes, and limits to be aware of.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-8 md:grid-cols-3">
                        <article>
                            <h3 className="font-serif text-2xl text-foreground">Choose by task</h3>
                            <p className="mt-3 text-sm leading-7 text-foreground/80">
                                The directory uses recognizable tasks and formats. PDF tools merge,
                                split, compare, and compress documents. Text tools count, transform,
                                encode, decode, and compare writing. Image tools resize, convert, merge,
                                and generate favicons. Developer, web, security, API, and calculator
                                tools cover the quick checks that often become a temporary script or
                                another browser tab.
                            </p>
                        </article>
                        <article>
                            <h3 className="font-serif text-2xl text-foreground">Keep input private</h3>
                            <p className="mt-3 text-sm leading-7 text-foreground/80">
                                Most utilities use browser APIs and client-side libraries, so files and
                                pasted text are processed on your device. That matters for contracts,
                                internal JSON, screenshots, access tokens, and other material you would
                                rather not upload. Tools that must contact another service say so in
                                their page copy and connect from your browser.
                            </p>
                        </article>
                        <article>
                            <h3 className="font-serif text-2xl text-foreground">Use it without friction</h3>
                            <p className="mt-3 text-sm leading-7 text-foreground/80">
                                There is no account, installation, premium tier, or usage quota. Search
                                by a tool name, file format, or job description, then copy or download
                                the result. The project is open source, so tool behavior can be reviewed
                                and fixes can be proposed in the public GitHub repository.
                            </p>
                        </article>
                    </div>

                    <div className="mt-10 border border-foreground/15 bg-secondary/20 p-6 sm:p-8">
                        <h3 className="font-serif text-2xl text-foreground">How to use FreeWebTools</h3>
                        <ol className="mt-5 grid gap-6 md:grid-cols-3">
                            <li>
                                <p className="eyebrow mb-2">01 · Find the right tool</p>
                                <p className="text-sm leading-7 text-foreground/80">
                                    Search by task, format, or tool name, or browse a category such as
                                    PDF, image, text, calculator, developer, security, web, or API.
                                    Each page focuses on one job and explains the input it accepts.
                                </p>
                            </li>
                            <li>
                                <p className="eyebrow mb-2">02 · Process in the browser</p>
                                <p className="text-sm leading-7 text-foreground/80">
                                    Add your text, file, values, or settings and run the utility. For
                                    local-first tools, the browser performs the work on your device
                                    without sending the source material to a FreeWebTools server.
                                </p>
                            </li>
                            <li>
                                <p className="eyebrow mb-2">03 · Take the result</p>
                                <p className="text-sm leading-7 text-foreground/80">
                                    Review the output, adjust the options when needed, then copy or
                                    download the finished result. You can move straight to another
                                    utility without creating an account or managing saved projects.
                                </p>
                            </li>
                        </ol>
                    </div>

                    <div className="mt-10 flex flex-col gap-4 border-t border-foreground/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                                <Share2 className="h-4 w-4" />
                                Share FreeWebTools
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Send the directory to someone who could use a free web tool.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                Facebook
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                LinkedIn
                            </a>
                            <a
                                href={`https://x.com/intent/post?url=${shareUrl}&text=${shareText}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                Share on X
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Operating notes */}
            <section className="border-t border-foreground/15 bg-secondary/40">
                <div className="container grid gap-8 py-12 md:grid-cols-12">
                    <div className="md:col-span-4">
                        <p className="eyebrow mb-3">Operating notes</p>
                        <h3 className="font-serif text-2xl text-foreground">What to expect.</h3>
                    </div>
                    <div className="grid gap-8 md:col-span-8 md:grid-cols-3">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider text-primary">01 · Local</p>
                            <p className="mt-2 text-sm text-foreground/80">
                                Local tools run in your browser. Files and pasted text are not uploaded
                                to a FreeWebTools processing server.
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider text-primary">02 · Direct</p>
                            <p className="mt-2 text-sm text-foreground/80">
                                Tool pages put the working controls first, followed by steps, use cases,
                                and answers to common questions.
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider text-primary">03 · Free</p>
                            <p className="mt-2 text-sm text-foreground/80">
                                No account, no premium tier, and no quota meter. The active tools are
                                available without sign-up.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
