import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getToolBySlug } from '@/lib/tools';
import { absoluteUrl, toolPath } from '@/lib/seo';
import { embedRegistry } from '@/lib/embedRegistry';

interface Params {
  params: Promise<{ categoryId: string; slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categoryId, slug } = await params;
  const tool = getToolBySlug(categoryId, slug);
  if (!tool) return {};
  // Embeds should not be indexed as separate pages; the canonical points to the
  // real tool page so link equity flows there.
  return {
    title: `${tool.name} — embedded`,
    robots: { index: false, follow: true },
    alternates: { canonical: absoluteUrl(toolPath(tool)) },
  };
}

export default async function EmbedPage({ params }: Params) {
  const { categoryId, slug } = await params;
  const tool = getToolBySlug(categoryId, slug);
  const key = `${categoryId}/${slug}`;
  const Client = embedRegistry[key];
  if (!tool || !Client) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1">
        <Client />
      </div>
      <div className="border-t border-border/60 bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">
        <Link
          href={absoluteUrl(toolPath(tool))}
          target="_blank"
          rel="noopener"
          className="font-medium text-foreground hover:underline"
        >
          {tool.name}
        </Link>{' '}
        by{' '}
        <Link
          href={absoluteUrl('/')}
          target="_blank"
          rel="noopener"
          className="font-medium text-foreground hover:underline"
        >
          FreeWebTools
        </Link>
      </div>
    </div>
  );
}
