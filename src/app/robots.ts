import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'Claude-SearchBot',
          'Claude-User',
        ],
        allow: '/',
        disallow: ['/api/', '/embed/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/embed/', '/*?utm_'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
