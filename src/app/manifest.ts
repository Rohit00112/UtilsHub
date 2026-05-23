import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UtilsHub',
    short_name: 'UtilsHub',
    description: 'Free browser-based utilities for PDF, image, text, security, calculators, and developer workflows. Tool input is processed locally.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111111',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
    categories: ['productivity', 'utilities', 'developer'],
  };
}
