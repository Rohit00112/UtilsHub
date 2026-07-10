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

export const siteName = 'FreeWebTools';
export const defaultDescription =
  'Free web tools for PDF, image, text, security, calculators, APIs, and developers. Most tools run in your browser with no sign-up required.';
export const defaultKeywords = [
  'free web tools',
  'free online tools',
  'online tools',
  'online utilities',
  'browser tools',
  'PDF tools',
  'developer tools',
  'privacy-first tools',
  'FreeWebTools',
];

const productionSiteUrl = 'https://freewebtools.app';

function normalizeSiteUrl(url: string) {
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withProtocol.replace(/\/$/, '');
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    (process.env.NODE_ENV === 'production' ? productionSiteUrl : 'http://localhost:3000');

  return normalizeSiteUrl(configuredUrl);
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
      : `${siteName} - Free Online Web Tools`;
  const url = absoluteUrl(path);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: resolvedTitle,
    description,
    applicationName: siteName,
    authors: [{ name: siteName, url: absoluteUrl('/about') }],
    creator: siteName,
    publisher: siteName,
    category: 'technology',
    manifest: '/manifest.webmanifest',
    icons: {
      icon: '/ico.png',
      apple: '/ico.png',
    },
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      'google-adsense-account': 'ca-pub-9243015758853816',
    },
    keywords: Array.from(new Set([...defaultKeywords, ...keywords])),
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName,
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: absoluteUrl('/opengraph-image'),
          width: 1200,
          height: 630,
          alt: `${siteName} - free online web tools`,
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

  const baseDescription = category.description.replace(/\.$/, '');
  const description = `${baseDescription}. Use free ${category.name.toLowerCase()} with no sign-up and browser-side processing.`;

  return createMetadata({
    fullTitle: `${category.name} — Free Online Utilities | ${siteName}`,
    description,
    path: categoryPath(category),
    keywords: category.keywords,
  });
}

export function createToolMetadata(categoryId: string, slug: string): Metadata {
  const tool = getToolBySlug(categoryId, slug);
  if (!tool) return createMetadata({ title: 'Tool', path: '/tools' });

  // Keyword-led, ~55–60 char target. Tool name + benefit + site name.
  const fullTitle = `${tool.name} — Free Online Tool | ${siteName}`;
  const baseDescription = tool.description.replace(/\.$/, '');
  const descriptionOptions = tool.categoryId === 'api'
    ? [
      `${baseDescription}. Free with no sign-up; requests run directly from your browser and are not proxied by FreeWebTools.`,
      `${baseDescription}. Free browser tool with no sign-up and no FreeWebTools proxy.`,
    ]
    : [
      `${baseDescription}. Free to use with no sign-up. Your input is processed locally in your browser and is not uploaded to a FreeWebTools server.`,
      `${baseDescription}. Free with no sign-up; input is processed locally in your browser and not uploaded to a FreeWebTools server.`,
      `${baseDescription}. Free browser tool with local processing and no sign-up.`,
    ];
  const description =
    descriptionOptions.find((option) => option.length <= 160) ||
    descriptionOptions[descriptionOptions.length - 1];

  return createMetadata({
    fullTitle,
    description,
    path: toolPath(tool),
    keywords: tool.keywords,
  });
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: siteName,
    url: absoluteUrl('/'),
    description: defaultDescription,
    inLanguage: 'en',
    publisher: {
      '@id': absoluteUrl('/#organization'),
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: siteName,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/ico.png'),
    sameAs: [
      'https://github.com/Rohit00112',
    ],
  };
}

function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function categoryJsonLd(category: Category) {
  const categoryTools = getToolsByCategory(category.id);
  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absoluteUrl(`${categoryPath(category)}#collection`),
    name: `${category.name} | ${siteName}`,
    url: absoluteUrl(categoryPath(category)),
    description: category.description,
    inLanguage: 'en',
    isPartOf: {
      '@id': absoluteUrl('/#website'),
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categoryTools.length,
      itemListElement: categoryTools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(toolPath(tool)),
        name: tool.name,
      })),
    },
    hasPart: categoryTools.map((tool) => ({
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

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: category.name, path: categoryPath(category) },
  ]);

  if (!category.faqs || category.faqs.length === 0) return [collectionPage, breadcrumb];

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: category.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return [collectionPage, breadcrumb, faqPage];
}

export function toolJsonLd(tool: Tool) {
  const category = getCategoryById(tool.categoryId);
  const path = toolPath(tool);
  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': absoluteUrl(`${path}#application`),
    name: tool.name,
    url: absoluteUrl(path),
    description: tool.description,
    applicationCategory: category?.name || 'Utility',
    applicationSubCategory: 'Browser-based utility',
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
    isPartOf: {
      '@id': absoluteUrl('/#website'),
    },
    provider: {
      '@id': absoluteUrl('/#organization'),
    },
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    {
      name: category?.name || 'Tools',
      path: category ? categoryPath(category) : '/tools',
    },
    { name: tool.name, path },
  ]);

  if (!tool.faqs || tool.faqs.length === 0) return [webApp, breadcrumb];

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

  return [webApp, breadcrumb, faqPage];
}

export function allSitemapEntries() {
  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly' as const, priority: 1 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: absoluteUrl('/privacy'), changeFrequency: 'yearly' as const, priority: 0.3 },
    ...categories.map((category) => ({
      url: absoluteUrl(categoryPath(category)),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...tools
      .filter((tool) => tool.status === 'active')
      .map((tool) => ({
        url: absoluteUrl(toolPath(tool)),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
  ];
}
