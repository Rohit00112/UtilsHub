import type { Metadata } from "next";
import Script from "next/script";
// @ts-ignore
import "./globals.css";
import { createMetadata } from "@/lib/seo";
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
            <body className="min-h-screen bg-background font-sans antialiased">
                <Script
                    id="adsbygoogle-init"
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9243015758853816"
                    strategy="lazyOnload"
                    crossOrigin="anonymous"
                />
                {gaId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                            strategy="lazyOnload"
                        />
                        <Script id="ga4-init" strategy="lazyOnload">
                            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
                        </Script>
                    </>
                )}
                <Script id="ms-clarity" strategy="lazyOnload">
                    {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "xmmy8i6fh8");`}
                </Script>
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
