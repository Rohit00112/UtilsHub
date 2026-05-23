/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.qrserver.com',
            },
        ],
    },
    async redirects() {
        return [
            // Resolve /tools/special/* cannibalization — 301 to canonical core tools
            { source: '/tools/special/text-diff', destination: '/tools/text/diff-checker', permanent: true },
            { source: '/tools/special/pdf-compare', destination: '/tools/pdf/compare', permanent: true },
            { source: '/tools/special/image-merger', destination: '/tools/image/merger', permanent: true },
            { source: '/tools/special/favicon-creator', destination: '/tools/image/favicon-generator', permanent: true },
            { source: '/tools/special/remove-duplicates', destination: '/tools/text/remove-duplicate-lines', permanent: true },
            // Catch-all for any other /tools/special/* paths
            { source: '/tools/special', destination: '/', permanent: true },
            { source: '/tools/special/:path*', destination: '/', permanent: true },
        ];
    },
};

module.exports = nextConfig;
