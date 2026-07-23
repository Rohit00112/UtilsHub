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
import {
  categorySlug,
  getAllCategories as getAllBlogCategories,
  getAllPosts,
  wordCount,
  type BlogPost,
} from '@/lib/blog';

export const siteName = 'FreeWebTools';
export const defaultDescription =
  'Free online tools for PDFs, images, text, developers, security, APIs, and calculations. No sign-up; most tools run locally in your browser.';
export const defaultKeywords = [
  'free online tools',
  'free web tools',
  'browser-based tools',
  'online PDF tools',
  'online image tools',
  'online text tools',
  'free developer tools',
  'JSON formatter online',
  'PDF merger online',
  'image resizer online',
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
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
        { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
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
  const description = `${baseDescription}. Browse free ${category.name.toLowerCase()} with no sign-up and browser-side processing.`;

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
  });
}

export function getHomeMetadata(): Metadata {
  const activeToolCount = tools.filter((tool) => tool.status === 'active').length;

  return createMetadata({
    fullTitle: 'Free Online Tools for PDF, Images & Developers | FreeWebTools',
    description:
      `Use ${activeToolCount} free online tools for PDFs, images, text, code, APIs, security, and calculations. No sign-up; most tools run locally in your browser.`,
    path: '/',
    keywords: [
      'free online tools no signup',
      'free developer tools',
      'online PDF tools',
      'online image tools',
      'online text tools',
      'JSON formatter',
      'PDF merger',
      'image resizer',
      'word counter',
    ],
  });
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: siteName,
    alternateName: 'Free Web Tools',
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
    logo: absoluteUrl('/favicon.svg'),
    description: defaultDescription,
    publishingPrinciples: absoluteUrl('/about#editorial-standards'),
    knowsAbout: ['PDF documents', 'web development', 'web security', 'image optimization', 'browser utilities'],
    sameAs: [
      'https://github.com/Rohit00112',
      'https://github.com/Rohit00112/UtilsHub',
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

function schemaApplicationCategory(categoryId: string) {
  if (categoryId === 'developer' || categoryId === 'api') return 'DeveloperApplication';
  if (categoryId === 'security') return 'SecurityApplication';
  if (categoryId === 'calculator') return 'FinanceApplication';
  if (categoryId === 'image' || categoryId === 'pdf') return 'MultimediaApplication';
  return 'UtilitiesApplication';
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
      applicationCategory: schemaApplicationCategory(category.id),
      applicationSubCategory: category.name,
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
    applicationCategory: schemaApplicationCategory(tool.categoryId),
    applicationSubCategory: category?.name || 'Browser-based utility',
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
    citation: tool.sources?.map((source) => ({
      '@type': 'CreativeWork',
      name: source.label,
      url: source.url,
    })),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    {
      name: category?.name || 'Tools',
      path: category ? categoryPath(category) : '/tools',
    },
    { name: tool.name, path },
  ]);

  const howTo = tool.steps?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to use ${tool.name}`,
        description: tool.description,
        step: tool.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: `Step ${index + 1}`,
          text: step,
        })),
      }
    : null;

  const schemas = howTo ? [webApp, breadcrumb, howTo] : [webApp, breadcrumb];
  if (!tool.faqs || tool.faqs.length === 0) return schemas;

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

  return [...schemas, faqPage];
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

export function allSitemapEntries() {
  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly' as const, priority: 1 },
    { url: absoluteUrl('/tools'), changeFrequency: 'weekly' as const, priority: 0.9 },
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
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly' as const, priority: 0.6 },
    ...getAllBlogCategories().map((category) => ({
      url: absoluteUrl(`/blog/category/${categorySlug(category.name)}`),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
    ...getAllPosts().map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedDate ?? post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}

// --- Blog ---

export function getBlogIndexMetadata(): Metadata {
  return createMetadata({
    fullTitle: `PDF, JSON & Developer Guides | ${siteName}`,
    description:
      'Clear guides for PDFs, JSON, images, web security, CSS, URLs, and developer tasks. Read direct answers, working examples, and tested steps.',
    path: '/blog',
    keywords: ['PDF guides', 'JSON guides', 'developer tutorials', 'web security guides', 'image optimization guides'],
  });
}

export function createBlogPostMetadata(post: BlogPost): Metadata {
  const metadata = createMetadata({
    fullTitle: `${post.title} | ${siteName}`,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updatedDate ?? post.date,
      authors: [siteName],
      section: post.category,
      tags: post.tags,
    },
  };
}

export function blogPostJsonLd(post: BlogPost) {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': absoluteUrl(`/blog/${post.slug}#article`),
    headline: post.title,
    description: post.description,
    url: absoluteUrl(`/blog/${post.slug}`),
    image: absoluteUrl('/opengraph-image'),
    datePublished: post.date,
    dateModified: post.updatedDate ?? post.date,
    inLanguage: 'en',
    articleSection: post.category,
    wordCount: wordCount(post.body),
    timeRequired: `PT${Math.max(1, Math.ceil(wordCount(post.body) / 220))}M`,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    isPartOf: { '@id': absoluteUrl('/blog#collection') },
    author: {
      '@type': 'Organization',
      name: siteName,
      url: absoluteUrl('/about'),
    },
    publisher: {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: siteName,
      url: absoluteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.svg'),
      },
    },
    keywords: [...(post.keywords ?? []), ...(post.tags ?? [])].join(', ') || undefined,
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/blog' },
    { name: post.category, path: `/blog/category/${categorySlug(post.category)}` },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  return [article, breadcrumb];
}

export function blogIndexJsonLd(posts: BlogPost[]) {
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absoluteUrl('/blog#collection'),
    url: absoluteUrl('/blog'),
    name: `Practical web tool guides | ${siteName}`,
    description: 'Guides for PDFs, JSON, images, security, CSS, URLs, and developer tasks.',
    isPartOf: { '@id': absoluteUrl('/#website') },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/blog' },
  ]);
  return [collection, breadcrumb];
}

export function getBlogCategoryMetadata(category: string): Metadata {
  return createMetadata({
    fullTitle: `${category} Guides: Clear Tutorials & Examples | ${siteName}`,
    description: `Read practical ${category.toLowerCase()} guides with direct answers, working examples, and links to free browser-based tools.`,
    path: `/blog/category/${categorySlug(category)}`,
    keywords: [`${category.toLowerCase()} guides`, `${category.toLowerCase()} tutorials`, `free ${category.toLowerCase()} tools`],
  });
}

export function getBlogPageMetadata(page: number): Metadata {
  return createMetadata({
    fullTitle: `Practical Web Tool Guides — Page ${page} | ${siteName}`,
    description:
      'More clear guides for PDFs, JSON, images, web security, CSS, URLs, and everyday developer tasks.',
    path: `/blog/page/${page}`,
    keywords: ['web tool guides', 'developer tutorials', 'free tools'],
  });
}

export function blogCategoryJsonLd(category: string, posts: BlogPost[]) {
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absoluteUrl(`/blog/category/${categorySlug(category)}#collection`),
    url: absoluteUrl(`/blog/category/${categorySlug(category)}`),
    name: `${category} guides`,
    description: `Practical ${category.toLowerCase()} guides with examples and browser-based tools.`,
    isPartOf: { '@id': absoluteUrl('/blog#collection') },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
    hasPart: posts.map((p) => ({
      '@type': 'BlogPosting',
      '@id': absoluteUrl(`/blog/${p.slug}#article`),
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
    })),
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/blog' },
    { name: category, path: `/blog/category/${categorySlug(category)}` },
  ]);
  return [collection, breadcrumb];
}
