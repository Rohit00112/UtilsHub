import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { getCategoryById } from '@/lib/tools';

interface ToolLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    category: string;
}

export default function ToolLayout({ children, title, description, category }: ToolLayoutProps) {
    const categoryInfo = getCategoryById(category);
    
    return (
        <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-muted/30">
            {/* Header / Hero Area for the Tool */}
            <div className="bg-background border-b border-border/40">
                <div className="container py-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
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

                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                        {title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 py-12">
                <div className="container">
                    <div className="bg-card rounded-xl border shadow-sm p-6 sm:p-10">
                        {children}
                    </div>
                    
                    {/* Privacy Notice */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground">
                            Privacy Note: This tool processes your data locally in your browser. Nothing is uploaded to our servers.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
