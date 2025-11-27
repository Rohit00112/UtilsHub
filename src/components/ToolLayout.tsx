import Link from 'next/link';

interface ToolLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    category: string;
}

export default function ToolLayout({ children, title, description, category }: ToolLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-bg-primary">
            {/* Header */}
            <div className="bg-bg-elevated border-b border-border">
                <div className="container py-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors mb-6"
                    >
                        ← Back to Home
                    </Link>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-text-tertiary mb-4 uppercase tracking-wider">
                        <Link href="/" className="hover:text-text-primary transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href={`/tools/${category}`} className="hover:text-text-primary transition-colors">
                            {category}
                        </Link>
                        <span>/</span>
                        <span className="text-text-primary">{title}</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-text-primary">{title}</h1>
                    <p className="text-lg text-text-secondary max-w-2xl">{description}</p>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 py-12 bg-bg-secondary/30">
                <div className="container">
                    <div className="bg-bg-primary rounded-xl border border-border p-6 sm:p-8 shadow-sm">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-bg-elevated border-t border-border py-8 text-center">
                <div className="container">
                    <p className="text-text-tertiary text-sm">
                        © 2024 UtilsHub - All tools are free and process data locally in your browser
                    </p>
                </div>
            </footer>
        </div>
    );
}
