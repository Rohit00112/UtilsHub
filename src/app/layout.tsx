import type { Metadata } from "next";
import "./globals.css";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({});

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
