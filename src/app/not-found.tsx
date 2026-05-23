import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';
import { categories, getToolsByCategory } from '@/lib/tools';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-muted/30">
            <div className="container py-16">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">404</p>
                    <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        This tool page does not exist
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        The link may be outdated, or the utility may have moved into another category.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link href="/" className="btn btn-primary gap-2">
                            <Home className="h-4 w-4" />
                            Home
                        </Link>
                        <Link href="/tools/developer" className="btn btn-secondary gap-2">
                            Developer tools
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/tools/${category.id}`}
                            className="group rounded-lg border bg-card p-5 transition-colors hover:border-primary/40"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-foreground">{category.name}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                                </div>
                                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                    {getToolsByCategory(category.id).length}
                                </span>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground">
                                Browse category
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
