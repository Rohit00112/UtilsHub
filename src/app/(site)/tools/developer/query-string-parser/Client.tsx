'use client';
import { useMemo, useState } from 'react';
import { Check, Clipboard, Plus, Trash2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';
type Pair = { id: number; key: string; value: string };
export default function QueryStringParser() {
  const [source, setSource] = useState('https://example.com/search?q=web+tools&page=2');
  const [base, setBase] = useState('https://example.com/search');
  const [pairs, setPairs] = useState<Pair[]>([{ id: 1, key: 'q', value: 'web tools' }, { id: 2, key: 'page', value: '2' }]);
  const [error, setError] = useState(''); const [copied, setCopied] = useState(false);
  const parse = () => { try { const isUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(source.trim()); const url = new URL(isUrl ? source.trim() : `https://local.invalid/?${source.replace(/^\?/, '')}`); setBase(isUrl ? `${url.origin}${url.pathname}${url.hash}` : ''); setPairs(Array.from(url.searchParams.entries()).map(([key, value], i) => ({ id: Date.now() + i, key, value }))); setError(''); } catch { setError('Enter a valid absolute URL or raw query string.'); } };
  const query = useMemo(() => { const p = new URLSearchParams(); pairs.forEach(({ key, value }) => { if (key) p.append(key, value); }); return p.toString(); }, [pairs]);
  const output = base ? `${base}${query ? `?${query}` : ''}` : query;
  const update = (id: number, field: 'key' | 'value', value: string) => setPairs((all) => all.map((p) => p.id === id ? { ...p, [field]: value } : p));
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <ToolLayout title="Query String Parser" description="Parse, edit, and rebuild URL query parameters" category="developer"><div className="mx-auto max-w-4xl space-y-6">
    <ToolPanel title="URL or query string"><div className="flex gap-2"><input className="input flex-1 font-mono" value={source} onChange={(e) => setSource(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && parse()} /><button className="btn btn-primary" onClick={parse}>Parse</button></div>{error && <ToolStatus tone="error" className="mt-3">{error}</ToolStatus>}</ToolPanel>
    <ToolPanel title="Parameters" description={`${pairs.length} parameter${pairs.length === 1 ? '' : 's'} — repeated keys are preserved.`} actions={<button className="btn btn-secondary gap-2" onClick={() => setPairs((p) => [...p, { id: Date.now(), key: '', value: '' }])}><Plus className="h-4 w-4" /> Add</button>}><div className="space-y-2">{pairs.map((pair) => <div className="grid grid-cols-[1fr_1fr_auto] gap-2" key={pair.id}><input aria-label="Parameter name" className="input font-mono" value={pair.key} onChange={(e) => update(pair.id, 'key', e.target.value)} placeholder="name" /><input aria-label="Parameter value" className="input font-mono" value={pair.value} onChange={(e) => update(pair.id, 'value', e.target.value)} placeholder="value" /><button aria-label="Remove parameter" className="btn btn-secondary px-3" onClick={() => setPairs((p) => p.filter((x) => x.id !== pair.id))}><Trash2 className="h-4 w-4" /></button></div>)}</div></ToolPanel>
    <ToolPanel title="Rebuilt output" actions={<button className="btn btn-secondary gap-2" disabled={!output} onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}</button>}><div className="rounded-md border bg-muted/30 p-4 break-all font-mono text-sm">{output || 'Add a parameter to generate output.'}</div></ToolPanel>
  </div></ToolLayout>;
}
