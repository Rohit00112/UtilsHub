import Link from 'next/link';
import { BookCheck, LockKeyhole, ShieldCheck, Zap } from 'lucide-react';
import { absoluteUrl, createMetadata, organizationJsonLd } from '@/lib/seo';
import { categories } from '@/lib/tools';

export const metadata = createMetadata({
    title: 'About',
    description: 'FreeWebTools is a free collection of browser-based utility tools. Most tools process input locally in your browser, with no account required.',
    path: '/about',
});

export default function AboutPage() {
    const jsonLd = [
        organizationJsonLd(),
        {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            '@id': absoluteUrl('/about#page'),
            url: absoluteUrl('/about'),
            name: 'About FreeWebTools',
            mainEntity: { '@id': absoluteUrl('/#organization') },
        },
    ];

    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-muted/20">
            {jsonLd.map((node, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
                />
            ))}
            <div className="container max-w-3xl py-16">
                <h1 className="text-4xl font-semibold text-foreground text-balance">About FreeWebTools</h1>
                <p className="mt-4 text-lg leading-8 text-muted-foreground text-pretty">
                    FreeWebTools is a free collection of utility tools that run in your browser.
                    There&apos;s no sign-up and no usage quota. For local tools, files and pasted
                    text stay on your device and are not uploaded to a FreeWebTools processing server.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-5">
                        <LockKeyhole className="h-5 w-5 text-muted-foreground" />
                        <h2 className="mt-3 font-semibold text-foreground">Local processing</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Local tool input is processed in your browser. Files and pasted text are not
                            uploaded to a FreeWebTools processing server.
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-5">
                        <Zap className="h-5 w-5 text-muted-foreground" />
                        <h2 className="mt-3 font-semibold text-foreground">Instant results</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            No server round-trip. Outputs appear as fast as the browser can compute them.
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-5">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <h2 className="mt-3 font-semibold text-foreground">Free, forever</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            No account, no upsell, no premium tier. Source code is openly available on GitHub.
                        </p>
                    </div>
                </div>

                <h2 className="mt-12 text-2xl font-semibold text-foreground">What&apos;s here</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {categories.map((category) => (
                        <li key={category.id}>
                            <Link
                                href={`/tools/${category.id}`}
                                className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/40"
                            >
                                <div className="font-medium text-foreground">{category.name}</div>
                                <div className="mt-1 text-sm text-muted-foreground">{category.description}</div>
                            </Link>
                        </li>
                    ))}
                </ul>

                <h2 className="mt-12 text-2xl font-semibold text-foreground">How it works</h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                    FreeWebTools is a Next.js application. Every tool is implemented as a client-side
                    component that uses the browser&apos;s built-in APIs — Web Crypto for hashing,
                    Canvas for image work, pdf-lib for PDF manipulation, and so on. Pages are
                    pre-rendered for fast first paint, and the interactive parts hydrate on demand.
                </p>

                <section id="editorial-standards" className="mt-12 scroll-mt-24 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                    <BookCheck className="h-6 w-6 text-primary" />
                    <h2 className="mt-4 text-2xl font-semibold text-foreground">Editorial and testing standards</h2>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                        The FreeWebTools editorial team writes each page from the behavior of the
                        working utility, then checks its inputs, outputs, privacy boundary, and known
                        limitations against the implementation.
                    </p>
                    <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-muted-foreground">
                        <li>Technical claims link to primary standards or platform documentation when available.</li>
                        <li>Measurements are published only when the method and test data can be reproduced.</li>
                        <li>Security and privacy notes distinguish local tools from tools that make network requests.</li>
                        <li>Substantive article reviews are shown with a visible updated date.</li>
                    </ul>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                        Found an error? Report it in the project&apos;s{' '}
                        <Link
                            href="https://github.com/Rohit00112/UtilsHub/issues"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-foreground underline underline-offset-4"
                        >
                            public issue tracker
                        </Link>
                        .
                    </p>
                </section>

                <h2 className="mt-12 text-2xl font-semibold text-foreground">How tool pages are written</h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                    Each tool page is based on the actual behavior of that utility: the inputs it accepts,
                    the output it creates, the browser APIs or libraries involved, and the cases where the
                    result should be double-checked. For example, the JWT decoder page notes that decoding
                    does not verify signatures, the BMI calculator explains that BMI is only a screening
                    measure, and the PDF compressor explains that savings depend on the structure of the
                    source file.
                </p>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                    The goal is to avoid thin converter pages. A visitor should be able to understand what
                    the tool does, when it is appropriate to use, what stays local, and what limitations
                    matter before relying on the result.
                </p>

                <h2 className="mt-12 text-2xl font-semibold text-foreground">Open source</h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                    The project is maintained on{' '}
                    <Link
                        href="https://github.com/Rohit00112/UtilsHub"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        GitHub
                    </Link>
                    . Issues, suggestions, and pull requests are welcome.
                </p>
            </div>
        </div>
    );
}
