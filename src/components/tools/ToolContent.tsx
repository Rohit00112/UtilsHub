import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, HelpCircle, ListChecks, ListOrdered } from 'lucide-react';
import { getRelatedTools, type Tool } from '@/lib/tools';
import { absoluteUrl, embedPath, toolPath } from '@/lib/seo';
import EmbedSnippet from './EmbedSnippet';
import ShareButtons from '../ShareButtons';

interface ToolContentProps {
  tool: Tool;
}

export default function ToolContent({ tool }: ToolContentProps) {
  const hasLong = Boolean(tool.longDescription);
  const hasSteps = (tool.steps?.length ?? 0) > 0;
  const hasUseCases = (tool.useCases?.length ?? 0) > 0;
  const hasFaqs = (tool.faqs?.length ?? 0) > 0;
  const related = getRelatedTools(tool.id, 4);
  const features = [
    'Free to use with no account or sign-up.',
    tool.categoryId === 'api'
      ? 'Connects directly from your browser to the URL you choose.'
      : 'Processes your input locally in your browser.',
    'Works in modern desktop and mobile browsers.',
    'Copy or download results when the tool supports it.',
  ];

  if (!hasLong && !hasSteps && !hasUseCases && !hasFaqs && related.length === 0) return null;

  return (
    <section className="mx-auto mt-10 max-w-4xl space-y-10 border-t border-border/60 pt-10">
      {hasLong && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-foreground">
            <BookOpen className="h-4 w-4" />
            About {tool.name}
          </h2>
          <div className="space-y-4">
            {tool.longDescription!.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph} className="text-base leading-7 text-foreground/90 text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {hasSteps && (
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <ListOrdered className="h-5 w-5 text-muted-foreground" />
            How to use {tool.name}
          </h2>
          <ol className="mt-4 space-y-2 text-base leading-7 text-foreground/90">
            {tool.steps!.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border bg-muted/40 text-xs font-semibold text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {hasUseCases && (
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <ListChecks className="h-5 w-5 text-muted-foreground" />
            Common use cases
          </h2>
          <ul className="mt-4 grid gap-2 text-base leading-7 text-foreground/90 sm:grid-cols-2">
            {tool.useCases!.map((uc, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground/60" aria-hidden="true" />
                <span>{uc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          {tool.name} features
        </h2>
        <ul className="mt-4 grid gap-2 text-base leading-7 text-foreground/90 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span
                className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground/60"
                aria-hidden="true"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {hasFaqs && (
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            Frequently asked questions
          </h2>
          <div className="mt-4 divide-y divide-border/60 rounded-lg border bg-card">
            {tool.faqs!.map((faq, i) => (
              <details key={i} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                  {faq.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-base leading-7 text-muted-foreground text-pretty">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      <EmbedSnippet embedUrl={absoluteUrl(embedPath(tool))} toolName={tool.name} />

      <ShareButtons url={absoluteUrl(toolPath(tool))} title={`${tool.name} — free online tool`} />

      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground">Related tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.id}
                href={toolPath(r)}
                className="group flex items-start justify-between gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div>
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{r.description}</div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
