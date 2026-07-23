import Link from 'next/link';
import { ChevronRight, Home, ShieldCheck } from 'lucide-react';
import { getCategoryById } from '@/lib/tools';

interface ToolLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    category: string;
    processingLabel?: string;
    privacyNote?: string;
}

export default function ToolLayout({
    children,
    title,
    description,
    category,
    processingLabel = 'Browser-local processing',
    privacyNote,
}: ToolLayoutProps) {
    const categoryInfo = getCategoryById(category);
    const resolvedPrivacyNote = privacyNote || (category === 'api'
        ? 'Network tools connect directly from your browser to the URL you choose; FreeWebTools does not proxy or store the request.'
        : 'Tool input is processed in your browser and is not uploaded to a FreeWebTools server.');
    
    return (
        <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
            <div className="relative overflow-hidden border-b border-border/70 bg-card/40">
                <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
                <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-96 rounded-full bg-primary/10 blur-[100px]" aria-hidden="true" />
                <div className="container relative py-9 sm:py-12">
                    <nav className="mb-7 flex min-w-0 items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
                            <Home className="h-3.5 w-3.5" />
                            <span>Home</span>
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={`/tools/${category}`} className="hover:text-foreground transition-colors">
                            {categoryInfo?.name || category}
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium truncate">{title}</span>
                    </nav>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="eyebrow">{categoryInfo?.name || category}</p>
                            <h1 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em] text-foreground text-balance sm:text-5xl">Free {title} Online</h1>
                            <p className="mt-3 text-base leading-7 text-muted-foreground text-pretty">{description}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-2 text-sm font-medium text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            {processingLabel}
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 py-10 sm:py-12">
                <div className="container">
                    <div className="animate-fade-in">
                        {children}
                    </div>

                    <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-muted-foreground text-pretty">
                        {resolvedPrivacyNote}
                    </p>
                </div>
            </main>
        </div>
    );
}
