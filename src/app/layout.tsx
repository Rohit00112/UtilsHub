import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { categoryPath, createMetadata, toolPath } from "@/lib/seo";
import ConsentScripts from "@/components/ConsentScripts";
import { ThemeProvider } from "@/components/ThemeProvider";
import { categories, getAllActiveTools } from "@/lib/tools";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = createMetadata({});

// GA4 measurement ID is public (ships to the client). Falls back to the site's
// property so analytics work in production even if the env var is not set.
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-6PG1LHQ9CF';
const adPaths = [
    '/',
    '/tools',
    '/blog',
    ...categories.map(categoryPath),
    ...getAllActiveTools().map(toolPath),
    ...getAllPosts().map((post) => `/blog/${post.slug}`),
];

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans antialiased">
                <ConsentScripts gaId={gaId} adPaths={adPaths} />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
