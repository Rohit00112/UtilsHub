import type { MetadataRoute } from 'next';
import { allSitemapEntries } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return allSitemapEntries();
}
