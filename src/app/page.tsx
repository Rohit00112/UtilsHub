import Link from 'next/link';
import { Zap, Shield, Target, Smartphone, ArrowRight } from 'lucide-react';
import { categories, getToolsByCategory } from '@/lib/tools';

export default function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="py-24 px-6 text-center border-b border-border/40">
                <div className="max-w-3xl mx-auto">
                    <h1 className="mb-6 animate-fade-in text-5xl font-extrabold tracking-tight sm:text-6xl">
                        UtilsHub
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                        The Professional All-in-One Utility Toolkit. <br className="hidden sm:block" />
                        Free, Secure, and Client-Side.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 sm:gap-16 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-foreground mb-1">30+</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Tools</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-foreground mb-1">7</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Categories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-foreground mb-1">100%</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Privacy</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-20 bg-muted/30">
                <div className="container">
                    <div className="flex flex-col items-center mb-12 text-center">
                        <h2 className="text-3xl font-bold mb-4 tracking-tight">Explore Toolkits</h2>
                        <p className="text-muted-foreground max-w-2xl">
                            Everything you need to process files, format data, and secure your workflow — all right in your browser.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => {
                            const categoryTools = getToolsByCategory(category.id);
                            return (
                                <Link
                                    href={`/tools/${category.id}`}
                                    key={category.id}
                                    className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                            {category.icon}
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-full">
                                            {categoryTools.length} tools
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                                        {category.name}
                                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {category.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {categoryTools.slice(0, 3).map((tool) => (
                                            <span key={tool.id} className="text-[10px] font-medium text-muted-foreground border border-border bg-muted/20 px-2 py-0.5 rounded-md">
                                                {tool.name}
                                            </span>
                                        ))}
                                        {categoryTools.length > 3 && (
                                            <span className="text-[10px] font-medium text-muted-foreground px-1">
                                                +{categoryTools.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 border-t border-border/40">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Lightning Fast</h3>
                            <p className="text-sm text-muted-foreground">Instant results powered by Web Workers and your browser&apos;s local processing engine.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">100% Private</h3>
                            <p className="text-sm text-muted-foreground">Your sensitive data and files never leave your device. Zero server-side storage or tracking.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">No Limits</h3>
                            <p className="text-sm text-muted-foreground">Unlimited usage, no sign-up required, and no credit card. Completely free for everyone.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                <Smartphone className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Universal</h3>
                            <p className="text-sm text-muted-foreground">A seamless experience across desktop, tablet, and mobile. Access your tools anywhere.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
