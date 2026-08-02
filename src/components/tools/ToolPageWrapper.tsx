import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getToolBySlug } from '@/lib/tools';
import { toolJsonLd } from '@/lib/seo';
import ToolContent from './ToolContent';
import RecentTracker from './RecentTracker';

interface ToolPageWrapperProps {
  categoryId: string;
  slug: string;
  children: ReactNode;
}

export default function ToolPageWrapper({ categoryId, slug, children }: ToolPageWrapperProps) {
  const tool = getToolBySlug(categoryId, slug);
  if (!tool) notFound();

  const jsonLdParts = toolJsonLd(tool);

  return (
    <>
      {jsonLdParts.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
      <RecentTracker toolId={tool.id} />
      {children}
      <div className="pb-14">
        <div className="container">
          <ToolContent tool={tool} />
        </div>
      </div>
    </>
  );
}
