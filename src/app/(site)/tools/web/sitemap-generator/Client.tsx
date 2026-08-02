'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Download, Eraser, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type Changefreq = 'none' | 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

const changefreqOptions: Array<{ label: string; value: Changefreq }> = [
    { label: 'None', value: 'none' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
];

const sampleUrls = 'https://example.com/\nhttps://example.com/about\nhttps://example.com/blog/launch-notes';

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function cleanUrls(value: string) {
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

function buildSitemap({
    urls,
    lastmod,
    changefreq,
    priority,
}: {
    urls: string[];
    lastmod: string;
    changefreq: Changefreq;
    priority: string;
}) {
    const rows = urls.map((url) => {
        const parts = ['  <url>', `    <loc>${escapeXml(url)}</loc>`];
        if (lastmod) parts.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
        if (changefreq !== 'none') parts.push(`    <changefreq>${changefreq}</changefreq>`);
        if (priority) parts.push(`    <priority>${escapeXml(priority)}</priority>`);
        parts.push('  </url>');
        return parts.join('\n');
    });

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        rows.join('\n'),
        '</urlset>',
        '',
    ].join('\n');
}

export default function SitemapGenerator() {
    const [urls, setUrls] = useToolState('sitemap-generator', 'urls', sampleUrls);
    const [lastmod, setLastmod] = useToolState('sitemap-generator', 'lastmod', () => new Date().toISOString().slice(0, 10));
    const [includeLastmod, setIncludeLastmod] = useToolState('sitemap-generator', 'includeLastmod', true);
    const [changefreq, setChangefreq] = useToolState<Changefreq>('sitemap-generator', 'changefreq', 'weekly');
    const [priority, setPriority] = useToolState('sitemap-generator', 'priority', '0.8');
    const [includePriority, setIncludePriority] = useToolState('sitemap-generator', 'includePriority', true);
    const [copied, setCopied] = useState(false);

    const urlList = useMemo(() => cleanUrls(urls), [urls]);
    const invalidUrls = useMemo(() => {
        return urlList.filter((url) => {
            try {
                const parsed = new URL(url);
                return parsed.protocol !== 'http:' && parsed.protocol !== 'https:';
            } catch {
                return true;
            }
        });
    }, [urlList]);

    const sitemap = useMemo(() => buildSitemap({
        urls: urlList,
        lastmod: includeLastmod ? lastmod : '',
        changefreq,
        priority: includePriority ? priority : '',
    }), [changefreq, includeLastmod, includePriority, lastmod, priority, urlList]);

    const copySitemap = async () => {
        await navigator.clipboard.writeText(sitemap);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const downloadSitemap = () => {
        const blob = new Blob([sitemap], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sitemap.xml';
        link.click();
        URL.revokeObjectURL(url);
    };

    const clearAll = () => {
        setUrls('');
        setCopied(false);
    };

    const loadSample = () => {
        setUrls(sampleUrls);
        setLastmod(new Date().toISOString().slice(0, 10));
        setIncludeLastmod(true);
        setChangefreq('weekly');
        setPriority('0.8');
        setIncludePriority(true);
        setCopied(false);
    };

    return (
        <ToolLayout title="Sitemap XML Generator" description="Generate sitemap.xml from a list of URLs" category="web">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="URLs" description="One absolute http or https URL per line.">
                    <ToolTextarea value={urls} onChange={(event) => setUrls(event.target.value)} className="min-h-56" />
                </ToolPanel>

                <ToolPanel title="Sitemap options">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                        <ToolField label="Last modified" htmlFor="lastmod">
                            <div className="flex items-center gap-3">
                                <input
                                    id="lastmod"
                                    type="date"
                                    value={lastmod}
                                    onChange={(event) => setLastmod(event.target.value)}
                                    disabled={!includeLastmod}
                                    className="input h-10"
                                />
                                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                    <input type="checkbox" checked={includeLastmod} onChange={(event) => setIncludeLastmod(event.target.checked)} className="h-4 w-4 accent-current" />
                                    Include
                                </label>
                            </div>
                        </ToolField>
                        <ToolField label="Change frequency">
                            <ToolSegmentedControl value={changefreq} options={changefreqOptions} onChange={setChangefreq} />
                        </ToolField>
                        <ToolField label="Priority" htmlFor="priority">
                            <div className="flex items-center gap-3">
                                <input
                                    id="priority"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={priority}
                                    onChange={(event) => setPriority(event.target.value)}
                                    disabled={!includePriority}
                                    className="input h-10 w-28 font-mono"
                                />
                                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                    <input type="checkbox" checked={includePriority} onChange={(event) => setIncludePriority(event.target.checked)} className="h-4 w-4 accent-current" />
                                    Include
                                </label>
                            </div>
                        </ToolField>
                    </div>
                </ToolPanel>

                {invalidUrls.length > 0 && (
                    <ToolStatus tone="error">
                        {invalidUrls.length} URL{invalidUrls.length === 1 ? '' : 's'} need a valid http or https URL.
                    </ToolStatus>
                )}

                <ToolActionBar>
                    <button type="button" onClick={copySitemap} disabled={urlList.length === 0} className="btn btn-primary gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy XML'}
                    </button>
                    <button type="button" onClick={downloadSitemap} disabled={urlList.length === 0} className="btn btn-secondary gap-2">
                        <Download className="h-4 w-4" />
                        Download
                    </button>
                    <button type="button" onClick={loadSample} className="btn btn-secondary gap-2">
                        <Wand2 className="h-4 w-4" />
                        Sample
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                <ToolPanel title="Generated sitemap.xml">
                    <pre className="min-h-72 overflow-auto rounded-md border bg-muted/20 p-4 font-mono text-sm leading-6 text-foreground whitespace-pre-wrap">
                        {urlList.length > 0 ? sitemap : 'Generated sitemap XML will appear here...'}
                    </pre>
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="URLs" value={urlList.length} />
                    <ToolMetric label="Invalid URLs" value={invalidUrls.length} />
                    <ToolMetric label="File size" value={`${new Blob([sitemap]).size} bytes`} />
                </div>
            </div>
        </ToolLayout>
    );
}
