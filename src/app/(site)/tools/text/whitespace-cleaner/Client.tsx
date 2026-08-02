'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Download, RotateCcw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolMetric, ToolPanel, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

export default function WhitespaceCleaner() {
  const [input, setInput] = useToolState('whitespace-cleaner', 'input', '');
  const [trimLines, setTrimLines] = useToolState('whitespace-cleaner', 'trimLines', true);
  const [collapseSpaces, setCollapseSpaces] = useToolState('whitespace-cleaner', 'collapseSpaces', true);
  const [blankMode, setBlankMode] = useToolState<'keep' | 'reduce' | 'remove'>('whitespace-cleaner', 'blankMode', 'reduce');
  const [copied, setCopied] = useState(false);
  const output = useMemo(() => {
    let lines = input.replace(/\r\n?/g, '\n').split('\n');
    if (trimLines) lines = lines.map((line) => line.trim());
    if (collapseSpaces) lines = lines.map((line) => line.replace(/[\t ]+/g, ' '));
    if (blankMode === 'remove') lines = lines.filter((line) => line.trim() !== '');
    if (blankMode === 'reduce') return lines.join('\n').replace(/\n{3,}/g, '\n\n');
    return lines.join('\n');
  }, [input, trimLines, collapseSpaces, blankMode]);
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  const download = () => { const url = URL.createObjectURL(new Blob([output], { type: 'text/plain' })); const a = document.createElement('a'); a.href = url; a.download = 'cleaned-text.txt'; a.click(); URL.revokeObjectURL(url); };

  return <ToolLayout title="Whitespace Cleaner" description="Normalize spaces, tabs, blank lines, and line endings" category="text">
    <div className="mx-auto max-w-5xl space-y-6">
      <ToolPanel title="Cleanup rules"><div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} /> Trim each line</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={collapseSpaces} onChange={(e) => setCollapseSpaces(e.target.checked)} /> Collapse spaces and tabs</label>
        <label className="flex items-center gap-2">Blank lines <select className="input h-9" value={blankMode} onChange={(e) => setBlankMode(e.target.value as typeof blankMode)}><option value="keep">Keep all</option><option value="reduce">Keep one</option><option value="remove">Remove all</option></select></label>
      </div></ToolPanel>
      <div className="grid gap-6 lg:grid-cols-2">
        <ToolPanel title="Original"><ToolTextarea className="min-h-72" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text to clean…" /></ToolPanel>
        <ToolPanel title="Cleaned" actions={<><button className="btn btn-secondary gap-2" disabled={!output} onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}</button><button className="btn btn-secondary gap-2" disabled={!output} onClick={download}><Download className="h-4 w-4" /> Download</button></>}><ToolTextarea className="min-h-72" value={output} readOnly placeholder="Cleaned text appears here" /></ToolPanel>
      </div>
      <div className="grid gap-3 sm:grid-cols-3"><ToolMetric label="Characters removed" value={Math.max(0, input.length - output.length)} /><ToolMetric label="Original lines" value={input ? input.split(/\r?\n/).length : 0} /><ToolMetric label="Cleaned lines" value={output ? output.split('\n').length : 0} /></div>
      <button className="btn btn-secondary gap-2" onClick={() => setInput('')}><RotateCcw className="h-4 w-4" /> Clear</button>
    </div>
  </ToolLayout>;
}
