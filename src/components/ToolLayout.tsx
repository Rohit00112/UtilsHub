import Link from 'next/link';
import { ChevronRight, Home, ShieldCheck } from 'lucide-react';
import { getCategoryById } from '@/lib/tools';

interface ToolLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    category: string;
}

export default function ToolLayout({ children, title, description, category }: ToolLayoutProps) {
    const categoryInfo = getCategoryById(category);
    const privacyNote = category === 'api'
        ? 'Network tools connect directly from your browser to the URL you choose; UtilsHub does not proxy or store the request.'
        : 'Tool input is processed in your browser and is not uploaded to a UtilsHub server.';
    
    return (
        <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-muted/20">
            <div className="border-b border-border/60 bg-background">
                <div className="container py-8">
                    <nav className="mb-5 flex min-w-0 items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
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
                            <h1 className="text-3xl font-semibold text-foreground text-balance sm:text-4xl">{title}</h1>
                            <p className="mt-3 text-base leading-7 text-muted-foreground text-pretty">{description}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-foreground" />
                            Browser-local processing
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 py-8 sm:py-10">
                <div className="container">
                    <div className="animate-fade-in">
                        {children}
                    </div>

                    <p className="mt-6 text-center text-xs text-muted-foreground text-pretty">
                        {privacyNote}
                    </p>
                </div>
            </main>
        </div>
    );
}
