'use client';

import { useState } from 'react';
import { Check, Code2, Copy } from 'lucide-react';

interface EmbedSnippetProps {
  embedUrl: string;
  toolName: string;
}

export default function EmbedSnippet({ embedUrl, toolName }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);
  const iframe = `<iframe src="${embedUrl}" title="${toolName} by FreeWebTools" width="100%" height="600" style="border:1px solid #e5e7eb;border-radius:8px" loading="lazy"></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(iframe);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-foreground">
        <Code2 className="h-5 w-5 text-muted-foreground" />
        Embed {toolName} on your site
      </h2>
      <p className="mb-3 text-base leading-7 text-foreground/90 text-pretty">
        Add this free tool to your own website or blog. Copy the snippet below and paste it into
        your HTML.
      </p>
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 pr-14 text-xs leading-6 text-foreground">
          <code>{iframe}</code>
        </pre>
        <button
          type="button"
          onClick={copy}
          className="btn btn-secondary absolute right-3 top-3 h-8 gap-1.5 px-3 text-xs"
          aria-label="Copy embed code"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
