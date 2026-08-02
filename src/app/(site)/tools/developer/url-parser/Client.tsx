'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, Link2, Plus, Trash2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolField, ToolMetric, ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

interface QueryRow {
    id: string;
    key: string;
    value: string;
}

function createRow(key = '', value = ''): QueryRow {
    return {
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        key,
        value,
    };
}

function parseUrlInput(input: string) {
    const trimmed = input.trim();
    if (!trimmed) {
        return { error: 'Enter a URL to parse.', url: null, note: '' };
    }

    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
    const normalized = hasScheme ? trimmed : `https://${trimmed}`;

    try {
        return {
            error: '',
            url: new URL(normalized),
            note: hasScheme ? '' : 'No scheme was provided, so https:// was used for parsing.',
        };
    } catch {
        return { error: 'Enter a valid absolute URL or host name.', url: null, note: '' };
    }
}

function rowsFromUrl(url: URL | null) {
    if (!url) return [];
    return Array.from(url.searchParams.entries()).map(([key, value]) => createRow(key, value));
}

function buildQueryJson(rows: QueryRow[]) {
    const result: Record<string, string | string[]> = {};

    rows.forEach((row) => {
        const key = row.key.trim();
        if (!key) return;

        if (result[key] === undefined) {
            result[key] = row.value;
            return;
        }

        if (Array.isArray(result[key])) {
            (result[key] as string[]).push(row.value);
            return;
        }

        result[key] = [result[key] as string, row.value];
    });

    return JSON.stringify(result, null, 2);
}

export default function UrlParser() {
    const [inputUrl, setInputUrl] = useToolState('url-parser', 'inputUrl', 'https://example.com/docs/search?q=utils&tag=web&tag=dev#results');
    const [queryRows, setQueryRows] = useToolState<QueryRow[]>('url-parser', 'queryRows', []);
    const [copied, setCopied] = useState<'url' | 'json' | null>(null);

    const parsed = useMemo(() => parseUrlInput(inputUrl), [inputUrl]);

    useEffect(() => {
        setQueryRows(rowsFromUrl(parsed.url));
        setCopied(null);
    }, [parsed.url, setQueryRows]);

    const rebuiltUrl = useMemo(() => {
        if (!parsed.url) return '';
        const nextUrl = new URL(parsed.url.toString());
        nextUrl.search = '';

        queryRows.forEach((row) => {
            const key = row.key.trim();
            if (key) nextUrl.searchParams.append(key, row.value);
        });

        return nextUrl.toString();
    }, [parsed.url, queryRows]);

    const queryJson = useMemo(() => buildQueryJson(queryRows), [queryRows]);

    const updateRow = (id: string, field: 'key' | 'value', value: string) => {
        setQueryRows((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
        setCopied(null);
    };

    const removeRow = (id: string) => {
        setQueryRows((rows) => rows.filter((row) => row.id !== id));
        setCopied(null);
    };

    const addRow = () => {
        setQueryRows((rows) => [...rows, createRow()]);
        setCopied(null);
    };

    const clearAll = () => {
        setInputUrl('');
        setQueryRows([]);
        setCopied(null);
    };

    const copyText = async (kind: 'url' | 'json', value: string) => {
        if (!value) return;
        await navigator.clipboard.writeText(value);
        setCopied(kind);
        setTimeout(() => setCopied(null), 1600);
    };

    const detailRows = parsed.url
        ? [
            ['Protocol', parsed.url.protocol.replace(':', '') || '-'],
            ['Host', parsed.url.host || '-'],
            ['Hostname', parsed.url.hostname || '-'],
            ['Port', parsed.url.port || '(default)'],
            ['Pathname', parsed.url.pathname || '/'],
            ['Hash', parsed.url.hash || '(none)'],
            ['Origin', parsed.url.origin || '-'],
        ]
        : [];

    return (
        <ToolLayout
            title="URL Parser & Query Builder"
            description="Parse URL parts, edit query parameters, and rebuild encoded URLs"
            category="developer"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="URL input">
                    <ToolField label="URL" htmlFor="url-input" description="Paste a full URL or a host name with path and query parameters.">
                        <input
                            id="url-input"
                            value={inputUrl}
                            onChange={(event) => setInputUrl(event.target.value)}
                            placeholder="https://example.com/path?key=value#section"
                            className="input h-11 font-mono"
                            spellCheck={false}
                        />
                    </ToolField>
                    {parsed.note && <ToolStatus tone="info" className="mt-3">{parsed.note}</ToolStatus>}
                    {parsed.error && inputUrl.trim() && <ToolStatus tone="error" className="mt-3">{parsed.error}</ToolStatus>}
                </ToolPanel>

                {parsed.url && (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <ToolMetric label="Query parameters" value={queryRows.filter((row) => row.key.trim()).length} />
                            <ToolMetric label="URL length" value={rebuiltUrl.length} />
                            <ToolMetric
                                label="Protocol"
                                value={<span className="flex min-w-0 items-center gap-2 text-base"><Link2 className="h-4 w-4 shrink-0" />{parsed.url.protocol.replace(':', '')}</span>}
                            />
                        </div>

                        <ToolPanel title="Parsed URL parts">
                            <div className="grid gap-3 md:grid-cols-2">
                                {detailRows.map(([label, value]) => (
                                    <div key={label} className="rounded-md border bg-muted/20 p-3">
                                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
                                        <div className="mt-1 break-all font-mono text-sm text-foreground">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </ToolPanel>

                        <ToolPanel
                            title="Query builder"
                            description="Duplicate keys are preserved and rebuilt in row order."
                            actions={
                                <button type="button" onClick={addRow} className="btn btn-secondary h-8 gap-2 px-3">
                                    <Plus className="h-4 w-4" />
                                    Add row
                                </button>
                            }
                        >
                            {queryRows.length === 0 ? (
                                <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                                    This URL has no query parameters. Add a row to build one.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {queryRows.map((row, index) => (
                                        <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                                            <input
                                                value={row.key}
                                                onChange={(event) => updateRow(row.id, 'key', event.target.value)}
                                                placeholder={`key_${index + 1}`}
                                                className="input h-10 font-mono"
                                                aria-label={`Query key ${index + 1}`}
                                                spellCheck={false}
                                            />
                                            <input
                                                value={row.value}
                                                onChange={(event) => updateRow(row.id, 'value', event.target.value)}
                                                placeholder="value"
                                                className="input h-10 font-mono"
                                                aria-label={`Query value ${index + 1}`}
                                                spellCheck={false}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeRow(row.id)}
                                                className="btn btn-secondary h-10 gap-2 px-3"
                                                aria-label={`Remove query row ${index + 1}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ToolPanel>

                        <ToolPanel
                            title="Rebuilt URL"
                            actions={
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => copyText('url', rebuiltUrl)} className="btn btn-secondary h-8 gap-2 px-3">
                                        {copied === 'url' ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                        {copied === 'url' ? 'Copied' : 'Copy URL'}
                                    </button>
                                    <button type="button" onClick={() => copyText('json', queryJson)} className="btn btn-secondary h-8 gap-2 px-3">
                                        {copied === 'json' ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                        {copied === 'json' ? 'Copied' : 'Copy query JSON'}
                                    </button>
                                </div>
                            }
                        >
                            <div className="rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                                <span className="break-all">{rebuiltUrl}</span>
                            </div>
                        </ToolPanel>

                        <ToolPanel title="Query JSON">
                            <pre className="overflow-x-auto rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                                {queryJson}
                            </pre>
                        </ToolPanel>
                    </>
                )}

                <ToolActionBar className="justify-center">
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>
            </div>
        </ToolLayout>
    );
}
