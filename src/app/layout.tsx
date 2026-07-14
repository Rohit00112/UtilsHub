import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({});

// GA4 measurement ID is public (ships to the client). Falls back to the site's
// property so analytics work in production even if the env var is not set.
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-6PG1LHQ9CF';

import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import SearchProvider from "@/components/SearchProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9243015758853816"
                    crossOrigin="anonymous"
                />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                {gaId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                            strategy="afterInteractive"
                        />
                        <Script id="ga4-init" strategy="afterInteractive">
                            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
                        </Script>
                    </>
                )}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SearchProvider>
                        <div className="relative flex min-h-screen flex-col">
                            <Navbar />
                            <main className="flex-1">{children}</main>
                            <Footer />
                        </div>
                        <CookieConsent />
                    </SearchProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
