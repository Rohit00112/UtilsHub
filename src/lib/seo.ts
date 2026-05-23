import type { Metadata } from 'next';
import {
  categories,
  getCategoryById,
  getToolBySlug,
  getToolsByCategory,
  tools,
  type Category,
  type Tool,
} from '@/lib/tools';

export const siteName = 'UtilsHub';
export const defaultDescription =
  'Free browser-based tools for PDF, image, text, security, calculators, and developer workflows. Nothing is uploaded — every tool runs on your device.';
export const defaultKeywords = [
  'online tools',
  'free utilities',
  'browser tools',
  'privacy-first tools',
  'UtilsHub',
];

let warnedMissingSiteUrl = false;
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (!fromEnv && process.env.NODE_ENV === 'production' && !warnedMissingSiteUrl) {
    warnedMissingSiteUrl = true;
    // Surface misconfiguration loudly during build
    // (avoids silently shipping localhost canonicals)
    console.warn('[seo] NEXT_PUBLIC_SITE_URL is not set in production build. Canonicals will point to localhost.');
  }
  return (fromEnv || 'http://localhost:3000').replace(/\/$/, '');
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

type MetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  /** Prefer the keyword-led title verbatim instead of `${title} | ${siteName}`. */
  fullTitle?: string;
};

export function createMetadata({
  title,
  description = defaultDescription,
  path = '/',
  keywords = [],
  fullTitle,
}: MetadataOptions): Metadata {
  const resolvedTitle = fullTitle
    ? fullTitle
    : title
      ? `${title} | ${siteName}`
      : `${siteName} – Free Browser-Based Utility Tools`;
  const url = absoluteUrl(path);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: resolvedTitle,
    description,
    applicationName: siteName,
    manifest: '/manifest.webmanifest',
    icons: {
      icon: '/icon.svg',
      apple: '/apple-icon.svg',
    },
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
    },
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
      images: [
        {
          url: absoluteUrl('/opengraph-image'),
          width: 1200,
          height: 630,
          alt: `${siteName} — free browser-based utility tools`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      images: [absoluteUrl('/opengraph-image')],
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

export function createToolMetadata(categoryId: string, slug: string): Metadata {
  const tool = getToolBySlug(categoryId, slug);
  if (!tool) return createMetadata({ title: 'Tool', path: '/tools' });

  // Keyword-led, ~55–60 char target. Tool name + benefit + site name.
  const fullTitle = `${tool.name} — Free Online Tool | ${siteName}`;
  return createMetadata({
    fullTitle,
    description: tool.description,
    path: toolPath(tool),
    keywords: tool.keywords,
  });
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: absoluteUrl('/'),
    description: defaultDescription,
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/icon.svg'),
    sameAs: [
      'https://github.com/Rohit00112/UtilsHub',
    ],
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
      operatingSystem: 'Any (browser)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    })),
  };
}

export function toolJsonLd(tool: Tool) {
  const category = getCategoryById(tool.categoryId);
  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: absoluteUrl(toolPath(tool)),
    description: tool.description,
    applicationCategory: category?.name || 'Utility',
    operatingSystem: 'Any (browser)',
    browserRequirements: 'Requires a modern browser with JavaScript enabled.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    isAccessibleForFree: true,
    inLanguage: 'en',
    keywords: tool.keywords?.join(', '),
  };

  if (!tool.faqs || tool.faqs.length === 0) return [webApp];

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return [webApp, faqPage];
}

export function allSitemapEntries() {
  const now = new Date();
  return [
    { url: absoluteUrl('/'), lastModified: now, priority: 1 },
    { url: absoluteUrl('/about'), lastModified: now, priority: 0.5 },
    ...categories.map((category) => ({
      url: absoluteUrl(categoryPath(category)),
      lastModified: now,
      priority: 0.8,
    })),
    ...tools
      .filter((tool) => tool.status === 'active')
      .map((tool) => ({
        url: absoluteUrl(toolPath(tool)),
        lastModified: now,
        priority: 0.7,
      })),
  ];
}
