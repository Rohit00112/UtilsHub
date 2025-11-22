import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "UtilsHub - All-in-One Utility Tools",
    description: "Free online tools for PDF, Image, Text, Document conversion, AI-powered utilities, and more. Over 50+ tools in one place.",
    keywords: ["PDF tools", "image converter", "text tools", "online utilities", "free tools"],
    authors: [{ name: "UtilsHub" }],
    openGraph: {
        title: "UtilsHub - All-in-One Utility Tools",
        description: "Free online tools for PDF, Image, Text, Document conversion, and more",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
