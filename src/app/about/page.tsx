import Link from 'next/link';
import { LockKeyhole, ShieldCheck, Zap } from 'lucide-react';
import { createMetadata } from '@/lib/seo';
import { categories } from '@/lib/tools';

export const metadata = createMetadata({
    title: 'About',
    description: 'UtilsHub is a free collection of browser-based utility tools. Files stay on your device — every tool runs locally in your browser.',
    path: '/about',
});

export default function AboutPage() {
    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-muted/20">
            <div className="container max-w-3xl py-16">
                <h1 className="text-4xl font-semibold text-foreground text-balance">About UtilsHub</h1>
                <p className="mt-4 text-lg leading-8 text-muted-foreground text-pretty">
                    UtilsHub is a free collection of everyday utility tools that run entirely in your
                    browser. There&apos;s no sign-up, no upload, and no quota — your files and pasted
                    text stay on your device.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-5">
                        <LockKeyhole className="h-5 w-5 text-muted-foreground" />
                        <h2 className="mt-3 font-semibold text-foreground">Local processing</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Tool input is processed in your browser. Files and pasted text are not
                            uploaded to a server.
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
                    UtilsHub is a Next.js application. Every tool is implemented as a client-side
                    component that uses the browser&apos;s built-in APIs — Web Crypto for hashing,
                    Canvas for image work, pdf-lib for PDF manipulation, and so on. Pages are
                    pre-rendered for fast first paint, and the interactive parts hydrate on demand.
                </p>

                <h2 className="mt-12 text-2xl font-semibold text-foreground">Open source</h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                    The full source lives at{' '}
                    <Link
                        href="https://github.com/Rohit00112/UtilsHub"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        github.com/Rohit00112/UtilsHub
                    </Link>
                    . Issues, suggestions, and pull requests are welcome.
                </p>
            </div>
        </div>
    );
}
