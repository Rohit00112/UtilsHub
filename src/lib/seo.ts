import type { Metadata } from 'next';
import { categories, getCategoryById, getToolsByCategory, tools, type Category, type Tool } from '@/lib/tools';

export const siteName = 'UtilsHub';
export const defaultDescription = 'Free browser-based tools for PDF, image, text, security, calculators, and developer workflows.';
export const defaultKeywords = ['online tools', 'free utilities', 'browser tools', 'privacy-first tools', 'UtilsHub'];

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function categoryPath(category: Category) {
  return `/tools/${category.id}`;
}

export function toolPath(tool: Tool) {
  return `/tools/${tool.categoryId}/${tool.slug}`;
}

export function createMetadata({
  title,
  description = defaultDescription,
  path = '/',
  keywords = [],
}: {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  const resolvedTitle = title ? `${title} | ${siteName}` : `${siteName} - All-in-One Utility Tools`;
  const url = absoluteUrl(path);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: resolvedTitle,
    description,
    keywords: Array.from(new Set([...defaultKeywords, ...keywords])),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: resolvedTitle,
      description,
    },
  };
}

export function getCategoryMetadata(categoryId: string): Metadata {
  const category = getCategoryById(categoryId);
  if (!category) return createMetadata({ title: 'Tools', path: '/tools' });

  return createMetadata({
    title: category.name,
    description: category.description,
    path: categoryPath(category),
    keywords: category.keywords,
  });
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: absoluteUrl('/'),
    description: defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function categoryJsonLd(category: Category) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} | ${siteName}`,
    url: absoluteUrl(categoryPath(category)),
    description: category.description,
    hasPart: getToolsByCategory(category.id).map((tool) => ({
      '@type': 'WebApplication',
      name: tool.name,
      url: absoluteUrl(toolPath(tool)),
      description: tool.description,
      applicationCategory: category.name,
      operatingSystem: 'Any',
    })),
  };
}

export function allSitemapEntries() {
  const now = new Date();
  return [
    { url: absoluteUrl('/'), lastModified: now, priority: 1 },
    ...categories.map((category) => ({
      url: absoluteUrl(categoryPath(category)),
      lastModified: now,
      priority: 0.8,
    })),
    ...tools.filter((tool) => tool.status === 'active').map((tool) => ({
      url: absoluteUrl(toolPath(tool)),
      lastModified: now,
      priority: 0.7,
    })),
  ];
}
