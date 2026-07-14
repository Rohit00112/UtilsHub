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
import { getAllPosts, type BlogPost } from '@/lib/blog';

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

export function embedPath(tool: Tool) {
  return `/embed/${tool.categoryId}/${tool.slug}`;
}

type MetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  /** Prefer the keyword-led title verbatim instead of `${title} | ${siteName}`. */
  fullTitle?: string;
  /** Absolute or root-relative OG/Twitter image URL. Defaults to the static card. */
  ogImage?: string;
};

/** Build a dynamic OG image URL for the /og route. */
export function ogImageUrl(params: { title: string; sub?: string; tag?: string }) {
  const qs = new URLSearchParams();
  qs.set('title', params.title);
  if (params.sub) qs.set('sub', params.sub);
  if (params.tag) qs.set('tag', params.tag);
  return absoluteUrl(`/og?${qs.toString()}`);
}

export function createMetadata({
  title,
  description = defaultDescription,
  path = '/',
  keywords = [],
  fullTitle,
  ogImage,
}: MetadataOptions): Metadata {
  const resolvedTitle = fullTitle
    ? fullTitle
    : title
      ? `${title} | ${siteName}`
      : `${siteName} - Free Online Web Tools`;
  const url = absoluteUrl(path);
  const ogImageResolved = ogImage
    ? (ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage))
    : absoluteUrl('/opengraph-image');

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
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    keywords: Array.from(new Set([...defaultKeywords, ...keywords])),
    alternates: {
      canonical: url,
      types: {
        'application/rss+xml': absoluteUrl('/feed.xml'),
      },
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
          url: ogImageResolved,
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
      images: [ogImageResolved],
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
    ogImage: ogImageUrl({
      title: category.name,
      sub: category.description,
      tag: 'Free online tools',
    }),
  });
}

export function createToolMetadata(categoryId: string, slug: string): Metadata {
  const tool = getToolBySlug(categoryId, slug);
  if (!tool) return createMetadata({ title: 'Tool', path: '/tools' });

  const fullTitle = `Free ${tool.name} Online | No Sign-Up Required`;
  let description: string;
  if (tool.metaDescription) {
    description = tool.metaDescription;
  } else {
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
    description =
      descriptionOptions.find((option) => option.length <= 160) ||
      descriptionOptions[descriptionOptions.length - 1];
  }

  return createMetadata({
    fullTitle,
    description,
    path: toolPath(tool),
    keywords: tool.keywords,
    ogImage: ogImageUrl({
      title: tool.name,
      sub: tool.description,
      tag: 'Free online tool',
    }),
  });
}

export function getHomeMetadata(): Metadata {
  return createMetadata({
    fullTitle: 'Free Web Tools Online | 60+ Browser Tools — No Sign-Up',
    description:
      '60+ free online web tools for developers, SEO pros & marketers. JSON formatter, Base64 encoder, MD5 generator & more. No signup. 100% private. Browser-based.',
    path: '/',
    keywords: [
      'free developer tools',
      'free SEO tools',
      'free PDF tools',
      'free image tools',
      'free text tools',
    ],
    ogImage: ogImageUrl({
      title: 'Free Web Tools Online',
      sub: '60+ browser-based tools with no sign-up',
      tag: 'FreeWebTools',
    }),
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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/tools')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
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

export function getToolsHubMetadata(): Metadata {
  const description =
    'Browse every free FreeWebTools utility in one place. PDF, image, text, security, calculator, web, API, and developer tools — no sign-up, most run locally in your browser.';
  return createMetadata({
    fullTitle: `All Free Online Tools — Full Directory | ${siteName}`,
    description,
    path: '/tools',
    keywords: ['all online tools', 'free tools directory', 'web tools list'],
  });
}

export function toolsHubJsonLd() {
  const activeTools = tools.filter((tool) => tool.status === 'active');
  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absoluteUrl('/tools#collection'),
    name: `All Tools | ${siteName}`,
    url: absoluteUrl('/tools'),
    description: 'Complete directory of free FreeWebTools online utilities.',
    inLanguage: 'en',
    isPartOf: { '@id': absoluteUrl('/#website') },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: activeTools.length,
      itemListElement: activeTools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(toolPath(tool)),
        name: tool.name,
      })),
    },
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'All Tools', path: '/tools' },
  ]);
  return [collectionPage, breadcrumb];
}

export function allSitemapEntries(lastModified?: Date) {
  const modified = lastModified ?? new Date();
  return [
    { url: absoluteUrl('/'), lastModified: modified, changeFrequency: 'weekly' as const, priority: 1 },
    { url: absoluteUrl('/tools'), lastModified: modified, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: absoluteUrl('/about'), lastModified: modified, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: absoluteUrl('/privacy'), lastModified: modified, changeFrequency: 'yearly' as const, priority: 0.3 },
    ...categories.map((category) => ({
      url: absoluteUrl(categoryPath(category)),
      lastModified: modified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...tools
      .filter((tool) => tool.status === 'active')
      .map((tool) => ({
        url: absoluteUrl(toolPath(tool)),
        lastModified: modified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    { url: absoluteUrl('/blog'), lastModified: modified, changeFrequency: 'weekly' as const, priority: 0.6 },
    ...getAllPosts().map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}

// --- Blog ---

export function getBlogIndexMetadata(): Metadata {
  return createMetadata({
    fullTitle: `Guides & How-Tos | ${siteName}`,
    description:
      'Practical guides on PDFs, images, JSON, and everyday web tasks — using free, privacy-first browser tools.',
    path: '/blog',
    keywords: ['web tools guides', 'how to', 'free tools tutorials'],
    ogImage: ogImageUrl({ title: 'Guides & How-Tos', sub: 'Practical, privacy-first tutorials', tag: 'Blog' }),
  });
}

export function createBlogPostMetadata(post: BlogPost): Metadata {
  return createMetadata({
    fullTitle: `${post.title} | ${siteName}`,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    ogImage: ogImageUrl({ title: post.title, sub: post.description, tag: 'Guide' }),
  });
}

export function blogPostJsonLd(post: BlogPost) {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': absoluteUrl(`/blog/${post.slug}#article`),
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'en',
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: { '@id': absoluteUrl('/#organization') },
    publisher: { '@id': absoluteUrl('/#organization') },
    keywords: post.keywords?.join(', '),
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  return [article, breadcrumb];
}
