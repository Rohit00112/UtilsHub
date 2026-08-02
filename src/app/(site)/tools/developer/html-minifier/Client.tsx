'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolMetric, ToolPanel, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const sample = `<!doctype html>
<html lang="en">
  <body>
    <!-- Introductory content -->
    <main>
      <h1>Hello world</h1>
      <p>A small page ready to minify.</p>
    </main>
  </body>
</html>`;

function minifyHtml(input: string, removeComments: boolean) {
  const protectedBlocks: string[] = [];
  let output = input.replace(/<(pre|textarea|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, (block) => {
    protectedBlocks.push(block);
    return `___HTML_BLOCK_${protectedBlocks.length - 1}___`;
  });

  if (removeComments) output = output.replace(/<!--(?!\[if)[\s\S]*?-->/gi, '');

  output = output
    .replace(/>\s+</g, '><')
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();

  return output.replace(/___HTML_BLOCK_(\d+)___/g, (_, index) => protectedBlocks[Number(index)]);
}

export default function HtmlMinifier() {
  const [input, setInput] = useToolState('html-minifier', 'input', sample);
  const [removeComments, setRemoveComments] = useToolState('html-minifier', 'removeComments', true);
  const [copied, setCopied] = useState(false);
  const output = useMemo(() => minifyHtml(input, removeComments), [input, removeComments]);
  const saved = input.length ? Math.max(0, Math.round((1 - output.length / input.length) * 100)) : 0;

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <ToolLayout title="HTML Minifier" description="Remove comments and unnecessary whitespace from HTML" category="developer">
      <div className="mx-auto max-w-6xl space-y-6">
        <ToolPanel title="Minification settings">
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={removeComments} onChange={(event) => setRemoveComments(event.target.checked)} className="h-4 w-4 accent-current" />
            Remove ordinary HTML comments
          </label>
        </ToolPanel>

        <div className="grid gap-4 lg:grid-cols-2">
          <ToolPanel title="Input HTML" actions={<button type="button" onClick={() => setInput('')} className="btn btn-secondary h-8 gap-2 px-3"><Eraser className="h-4 w-4" /> Clear</button>}>
            <ToolTextarea value={input} onChange={(event) => { setInput(event.target.value); setCopied(false); }} className="min-h-[380px]" placeholder="Paste HTML here..." />
          </ToolPanel>
          <ToolPanel title="Minified HTML" actions={<button type="button" onClick={copy} disabled={!output} className="btn btn-secondary h-8 gap-2 px-3">{copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}{copied ? 'Copied' : 'Copy'}</button>}>
            <ToolTextarea value={output} readOnly className="min-h-[380px]" placeholder="Minified HTML will appear here..." />
          </ToolPanel>
        </div>

        <ToolActionBar className="grid grid-cols-3 gap-3">
          <ToolMetric label="Original" value={`${input.length.toLocaleString()} chars`} />
          <ToolMetric label="Minified" value={`${output.length.toLocaleString()} chars`} />
          <ToolMetric label="Saved" value={`${saved}%`} />
        </ToolActionBar>
      </div>
    </ToolLayout>
  );
}
