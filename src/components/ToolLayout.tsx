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
            <div className="bg-bg-secondary border-b border-border relative">
                {/* Background Mesh */}
                <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />

                <div className="container py-8 relative z-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-primary-light font-semibold mb-4 transition-all duration-fast hover:text-primary hover:-translate-x-1"
                    >
                        ← Back to Home
                    </Link>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-text-tertiary mb-4">
                        <Link href="/" className="text-text-secondary hover:text-primary transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href={`/tools/${category}`} className="text-text-secondary hover:text-primary transition-colors">
                            {category}
                        </Link>
                        <span>/</span>
                        <span>{title}</span>
                    </div>

                    <h1 className="text-5xl font-bold mb-2 text-gradient">{title}</h1>
                    <p className="text-xl text-text-secondary m-0">{description}</p>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 py-12">
                <div className="container">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-bg-secondary border-t border-border py-8 text-center">
                <div className="container">
                    <p className="text-text-tertiary text-sm m-0">
                        © 2024 UtilsHub - All tools are free and process data locally in your browser
                    </p>
                </div>
            </footer>
        </div>
    );
}
