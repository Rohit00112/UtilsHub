'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Download, Eraser, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';

function cleanLines(value: string) {
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

function normalizePath(value: string) {
    if (value === '*') return value;
    return value.startsWith('/') ? value : `/${value}`;
}

function buildRobots({
    userAgent,
    allow,
    disallow,
    sitemap,
    crawlDelay,
}: {
    userAgent: string;
    allow: string;
    disallow: string;
    sitemap: string;
    crawlDelay: string;
}) {
    const lines = [`User-agent: ${userAgent.trim() || '*'}`];

    cleanLines(allow).forEach((path) => lines.push(`Allow: ${normalizePath(path)}`));
    cleanLines(disallow).forEach((path) => lines.push(`Disallow: ${normalizePath(path)}`));

    const delay = crawlDelay.trim();
    if (delay) lines.push(`Crawl-delay: ${delay}`);

    const sitemaps = cleanLines(sitemap);
    if (sitemaps.length > 0) {
        lines.push('');
        sitemaps.forEach((url) => lines.push(`Sitemap: ${url}`));
    }

    return `${lines.join('\n')}\n`;
}

const sample = {
    userAgent: '*',
    allow: '/\n/assets/',
    disallow: '/admin/\n/api/private/\n/search',
    sitemap: 'https://example.com/sitemap.xml',
    crawlDelay: '5',
};

export default function RobotsGenerator() {
    const [userAgent, setUserAgent] = useState(sample.userAgent);
    const [allow, setAllow] = useState(sample.allow);
    const [disallow, setDisallow] = useState(sample.disallow);
    const [sitemap, setSitemap] = useState(sample.sitemap);
    const [crawlDelay, setCrawlDelay] = useState(sample.crawlDelay);
    const [copied, setCopied] = useState(false);

    const robots = useMemo(() => buildRobots({ userAgent, allow, disallow, sitemap, crawlDelay }), [
        allow,
        crawlDelay,
        disallow,
        sitemap,
        userAgent,
    ]);

    const rules = cleanLines(allow).length + cleanLines(disallow).length;
    const hasSensitiveDisallow = cleanLines(disallow).some((path) => /secret|password|token|private/i.test(path));

    const copyRobots = async () => {
        await navigator.clipboard.writeText(robots);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const downloadRobots = () => {
        const blob = new Blob([robots], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'robots.txt';
        link.click();
        URL.revokeObjectURL(url);
    };

    const clearAll = () => {
        setUserAgent('*');
        setAllow('');
        setDisallow('');
        setSitemap('');
        setCrawlDelay('');
        setCopied(false);
    };

    const loadSample = () => {
        setUserAgent(sample.userAgent);
        setAllow(sample.allow);
        setDisallow(sample.disallow);
        setSitemap(sample.sitemap);
        setCrawlDelay(sample.crawlDelay);
        setCopied(false);
    };

    return (
        <ToolLayout title="Robots.txt Generator" description="Generate crawler directives with sitemap and crawl-delay options" category="web">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Crawler settings">
                    <div className="grid gap-4 md:grid-cols-2">
                        <ToolField label="User-agent" htmlFor="user-agent">
                            <input
                                id="user-agent"
                                value={userAgent}
                                onChange={(event) => setUserAgent(event.target.value)}
                                placeholder="*"
                                className="input h-10 font-mono"
                            />
                        </ToolField>
                        <ToolField label="Crawl delay" htmlFor="crawl-delay" description="Optional number of seconds. Some crawlers ignore this directive.">
                            <input
                                id="crawl-delay"
                                type="number"
                                min="0"
                                value={crawlDelay}
                                onChange={(event) => setCrawlDelay(event.target.value)}
                                placeholder="5"
                                className="input h-10 font-mono"
                            />
                        </ToolField>
                    </div>
                </ToolPanel>

                <div className="grid gap-6 lg:grid-cols-2">
                    <ToolPanel title="Allowed paths" description="One path per line. Leave empty if no explicit allow rules are needed.">
                        <ToolTextarea value={allow} onChange={(event) => setAllow(event.target.value)} placeholder={'/\n/assets/'} className="min-h-52" />
                    </ToolPanel>
                    <ToolPanel title="Disallowed paths" description="One path per line. Use /admin/ style paths, not full URLs.">
                        <ToolTextarea value={disallow} onChange={(event) => setDisallow(event.target.value)} placeholder={'/admin/\n/search'} className="min-h-52" />
                    </ToolPanel>
                </div>

                <ToolPanel title="Sitemaps" description="Optional sitemap URLs, one per line.">
                    <ToolTextarea value={sitemap} onChange={(event) => setSitemap(event.target.value)} placeholder="https://example.com/sitemap.xml" className="min-h-28" />
                </ToolPanel>

                {hasSensitiveDisallow && (
                    <ToolStatus tone="warning">
                        Robots.txt is public. Listing sensitive paths can reveal where private areas live, so protect them with authentication too.
                    </ToolStatus>
                )}

                <ToolActionBar>
                    <button type="button" onClick={copyRobots} className="btn btn-primary gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy robots.txt'}
                    </button>
                    <button type="button" onClick={downloadRobots} className="btn btn-secondary gap-2">
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

                <ToolPanel title="Generated robots.txt">
                    <pre className="min-h-64 overflow-auto rounded-md border bg-muted/20 p-4 font-mono text-sm leading-6 text-foreground whitespace-pre-wrap">
                        {robots}
                    </pre>
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Path rules" value={rules} />
                    <ToolMetric label="Sitemaps" value={cleanLines(sitemap).length} />
                    <ToolMetric label="File size" value={`${new Blob([robots]).size} bytes`} />
                </div>
            </div>
        </ToolLayout>
    );
}
