'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, ShieldCheck, ShieldX } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolMetric, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

interface HeaderEntry {
    name: string;
    value: string;
}

interface Finding {
    label: string;
    status: 'pass' | 'warn' | 'fail';
    detail: string;
}

const sampleHeaders = `HTTP/2 200 OK
content-type: text/html; charset=utf-8
cache-control: public, max-age=3600
strict-transport-security: max-age=31536000; includeSubDomains
content-security-policy: default-src 'self'; frame-ancestors 'none'
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
access-control-allow-origin: https://example.com`;

function parseHeaders(input: string) {
    const entries: HeaderEntry[] = [];
    const errors: string[] = [];

    input.split(/\r?\n/).forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (index === 0 && /^HTTP\/\d(?:\.\d)?\s+\d{3}/i.test(trimmed)) return;

        const separatorIndex = trimmed.indexOf(':');
        if (separatorIndex <= 0) {
            errors.push(`Line ${index + 1} is missing a header name or colon.`);
            return;
        }

        entries.push({
            name: trimmed.slice(0, separatorIndex).trim(),
            value: trimmed.slice(separatorIndex + 1).trim(),
        });
    });

    return { entries, errors };
}

function getHeader(entries: HeaderEntry[], name: string) {
    const normalized = name.toLowerCase();
    return entries.find((entry) => entry.name.toLowerCase() === normalized)?.value || '';
}

function hasHeader(entries: HeaderEntry[], name: string) {
    return Boolean(getHeader(entries, name));
}

function analyzeHeaders(entries: HeaderEntry[]) {
    const findings: Finding[] = [];
    const add = (finding: Finding) => findings.push(finding);

    add(hasHeader(entries, 'strict-transport-security')
        ? { label: 'HSTS', status: 'pass', detail: 'Strict-Transport-Security is present for HTTPS hardening.' }
        : { label: 'HSTS', status: 'fail', detail: 'Add Strict-Transport-Security on HTTPS responses.' });

    add(hasHeader(entries, 'content-security-policy')
        ? { label: 'Content Security Policy', status: 'pass', detail: 'Content-Security-Policy is present.' }
        : { label: 'Content Security Policy', status: 'warn', detail: 'Add CSP to reduce injection and framing risk.' });

    add(getHeader(entries, 'x-content-type-options').toLowerCase() === 'nosniff'
        ? { label: 'MIME sniffing', status: 'pass', detail: 'X-Content-Type-Options is set to nosniff.' }
        : { label: 'MIME sniffing', status: 'warn', detail: 'Set X-Content-Type-Options: nosniff.' });

    add(hasHeader(entries, 'referrer-policy')
        ? { label: 'Referrer Policy', status: 'pass', detail: `Referrer-Policy is ${getHeader(entries, 'referrer-policy')}.` }
        : { label: 'Referrer Policy', status: 'warn', detail: 'Add Referrer-Policy to control cross-site URL leakage.' });

    const cacheControl = getHeader(entries, 'cache-control').toLowerCase();
    if (!cacheControl) {
        add({ label: 'Cache policy', status: 'warn', detail: 'Cache-Control is missing.' });
    } else if (cacheControl.includes('no-store')) {
        add({ label: 'Cache policy', status: 'pass', detail: 'Cache-Control uses no-store for sensitive responses.' });
    } else if (cacheControl.includes('max-age')) {
        add({ label: 'Cache policy', status: 'pass', detail: `Cache-Control is set to ${getHeader(entries, 'cache-control')}.` });
    } else {
        add({ label: 'Cache policy', status: 'warn', detail: 'Cache-Control is present but has no max-age or no-store directive.' });
    }

    const allowOrigin = getHeader(entries, 'access-control-allow-origin');
    const allowCredentials = getHeader(entries, 'access-control-allow-credentials').toLowerCase();
    if (!allowOrigin) {
        add({ label: 'CORS', status: 'warn', detail: 'No Access-Control-Allow-Origin header was found.' });
    } else if (allowOrigin === '*' && allowCredentials === 'true') {
        add({ label: 'CORS', status: 'fail', detail: 'Wildcard origins cannot be combined with credentials.' });
    } else {
        add({ label: 'CORS', status: 'pass', detail: `Access-Control-Allow-Origin is ${allowOrigin}.` });
    }

    return findings;
}

function summarize(entries: HeaderEntry[], findings: Finding[]) {
    const counts = findings.reduce(
        (total, finding) => {
            total[finding.status] += 1;
            return total;
        },
        { pass: 0, warn: 0, fail: 0 }
    );

    return [
        `Headers parsed: ${entries.length}`,
        `Passed: ${counts.pass}`,
        `Warnings: ${counts.warn}`,
        `Failures: ${counts.fail}`,
        '',
        ...findings.map((finding) => `[${finding.status.toUpperCase()}] ${finding.label}: ${finding.detail}`),
    ].join('\n');
}

export default function HttpHeadersAnalyzer() {
    const [headers, setHeaders] = useToolState('http-headers-analyzer', 'headers', sampleHeaders);
    const [copied, setCopied] = useState(false);

    const parsed = useMemo(() => parseHeaders(headers), [headers]);
    const findings = useMemo(() => analyzeHeaders(parsed.entries), [parsed.entries]);
    const counts = findings.reduce(
        (total, finding) => {
            total[finding.status] += 1;
            return total;
        },
        { pass: 0, warn: 0, fail: 0 }
    );

    const copySummary = async () => {
        await navigator.clipboard.writeText(summarize(parsed.entries, findings));
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setHeaders('');
        setCopied(false);
    };

    return (
        <ToolLayout
            title="HTTP Headers Analyzer"
            description="Paste response headers and review security, cache, and CORS signals"
            category="api"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel
                    title="Response headers"
                    description="Paste raw response headers from a browser, curl, proxy, or API client."
                    actions={
                        <button type="button" onClick={clearAll} className="btn btn-secondary h-8 gap-2 px-3">
                            <Eraser className="h-4 w-4" />
                            Clear
                        </button>
                    }
                >
                    <ToolTextarea
                        value={headers}
                        onChange={(event) => {
                            setHeaders(event.target.value);
                            setCopied(false);
                        }}
                        placeholder="content-type: application/json"
                        className="min-h-[340px]"
                        spellCheck={false}
                    />
                    {parsed.errors.length > 0 && (
                        <ToolStatus tone="error" className="mt-3">
                            {parsed.errors.slice(0, 3).join(' ')}
                        </ToolStatus>
                    )}
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-4">
                    <ToolMetric label="Headers" value={parsed.entries.length} />
                    <ToolMetric label="Pass" value={counts.pass} />
                    <ToolMetric label="Warnings" value={counts.warn} />
                    <ToolMetric label="Failures" value={counts.fail} />
                </div>

                <ToolPanel
                    title="Analysis"
                    description="Checks focus on common production response header signals."
                    actions={
                        <button type="button" onClick={copySummary} disabled={parsed.entries.length === 0} className="btn btn-secondary h-8 gap-2 px-3">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy summary'}
                        </button>
                    }
                >
                    {parsed.entries.length === 0 ? (
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Paste headers to see security, cache, and CORS findings.
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                            {findings.map((finding) => (
                                <div key={finding.label} className="rounded-md border bg-muted/20 p-4">
                                    <div className="flex items-center gap-2 font-medium text-foreground">
                                        {finding.status === 'pass' ? (
                                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                            <ShieldX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        )}
                                        {finding.label}
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{finding.detail}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>

                <ToolPanel title="Parsed header table">
                    {parsed.entries.length === 0 ? (
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Parsed headers will appear here.
                        </div>
                    ) : (
                        <div className="divide-y rounded-md border">
                            {parsed.entries.map((entry, index) => (
                                <div key={`${entry.name}-${index}`} className="grid gap-2 p-3 md:grid-cols-[260px_1fr]">
                                    <div className="break-all font-mono text-sm font-medium text-foreground">{entry.name}</div>
                                    <div className="break-all font-mono text-sm text-muted-foreground">{entry.value || '(empty)'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
