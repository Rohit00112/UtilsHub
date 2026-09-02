import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { createMetadata } from "@/lib/seo";
import ConsentScripts from "@/components/ConsentScripts";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = createMetadata({});

// GA4 measurement ID is public (ships to the client). Falls back to the site's
// property so analytics work in production even if the env var is not set.
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-6PG1LHQ9CF';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='11707085',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                <ConsentScripts gaId={gaId} />
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
