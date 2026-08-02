'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Search } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolEmptyState,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type StatusClass = 'all' | '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

interface HttpStatus {
    code: number;
    phrase: string;
    meaning: string;
    use: string;
}

const statusClassOptions: Array<{ label: string; value: StatusClass }> = [
    { label: 'All', value: 'all' },
    { label: '1xx', value: '1xx' },
    { label: '2xx', value: '2xx' },
    { label: '3xx', value: '3xx' },
    { label: '4xx', value: '4xx' },
    { label: '5xx', value: '5xx' },
];

const statuses: HttpStatus[] = [
    { code: 100, phrase: 'Continue', meaning: 'The initial request was received; continue sending the body.', use: 'Large uploads with Expect headers.' },
    { code: 101, phrase: 'Switching Protocols', meaning: 'The server is switching to a different protocol.', use: 'WebSocket upgrades.' },
    { code: 200, phrase: 'OK', meaning: 'The request succeeded.', use: 'Successful reads, updates, or simple actions.' },
    { code: 201, phrase: 'Created', meaning: 'A new resource was created.', use: 'POST requests that create records.' },
    { code: 202, phrase: 'Accepted', meaning: 'The request was accepted but processing is not complete.', use: 'Async jobs and queues.' },
    { code: 204, phrase: 'No Content', meaning: 'The request succeeded with no response body.', use: 'Deletes or updates with empty responses.' },
    { code: 301, phrase: 'Moved Permanently', meaning: 'The resource has a permanent new URL.', use: 'Canonical redirects.' },
    { code: 302, phrase: 'Found', meaning: 'The resource is temporarily available elsewhere.', use: 'Temporary redirects.' },
    { code: 304, phrase: 'Not Modified', meaning: 'Cached client copy is still valid.', use: 'Conditional GET and browser caching.' },
    { code: 307, phrase: 'Temporary Redirect', meaning: 'Repeat the request at another URL with the same method.', use: 'Temporary method-preserving redirects.' },
    { code: 308, phrase: 'Permanent Redirect', meaning: 'Permanent redirect that preserves the HTTP method.', use: 'Permanent API endpoint moves.' },
    { code: 400, phrase: 'Bad Request', meaning: 'The request is malformed or invalid.', use: 'Invalid JSON or query syntax.' },
    { code: 401, phrase: 'Unauthorized', meaning: 'Authentication is required or failed.', use: 'Missing or invalid credentials.' },
    { code: 403, phrase: 'Forbidden', meaning: 'The client is authenticated but not allowed.', use: 'Permission or policy failures.' },
    { code: 404, phrase: 'Not Found', meaning: 'The resource does not exist at this URL.', use: 'Missing pages or records.' },
    { code: 405, phrase: 'Method Not Allowed', meaning: 'The resource does not support this HTTP method.', use: 'POST to read-only endpoints.' },
    { code: 409, phrase: 'Conflict', meaning: 'The request conflicts with current resource state.', use: 'Duplicate names or version conflicts.' },
    { code: 410, phrase: 'Gone', meaning: 'The resource used to exist but is intentionally gone.', use: 'Removed content with no replacement.' },
    { code: 422, phrase: 'Unprocessable Content', meaning: 'The request is syntactically valid but semantically invalid.', use: 'Field validation errors.' },
    { code: 429, phrase: 'Too Many Requests', meaning: 'The client hit a rate limit.', use: 'API throttling.' },
    { code: 500, phrase: 'Internal Server Error', meaning: 'The server failed unexpectedly.', use: 'Unhandled server errors.' },
    { code: 502, phrase: 'Bad Gateway', meaning: 'A gateway received an invalid upstream response.', use: 'Proxy or upstream failures.' },
    { code: 503, phrase: 'Service Unavailable', meaning: 'The server is temporarily unable to handle the request.', use: 'Maintenance or overloaded services.' },
    { code: 504, phrase: 'Gateway Timeout', meaning: 'A gateway timed out waiting for an upstream response.', use: 'Slow upstream dependencies.' },
];

function statusClass(code: number): StatusClass {
    return `${Math.floor(code / 100)}xx` as StatusClass;
}

export default function HttpStatusReference() {
    const [query, setQuery] = useToolState('http-status', 'query', '');
    const [selectedClass, setSelectedClass] = useToolState<StatusClass>('http-status', 'selectedClass', 'all');
    const [copied, setCopied] = useState<number | null>(null);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return statuses.filter((status) => {
            const matchesClass = selectedClass === 'all' || statusClass(status.code) === selectedClass;
            const haystack = `${status.code} ${status.phrase} ${status.meaning} ${status.use}`.toLowerCase();
            return matchesClass && (!needle || haystack.includes(needle));
        });
    }, [query, selectedClass]);

    const copyStatus = async (status: HttpStatus) => {
        await navigator.clipboard.writeText(`${status.code} ${status.phrase}`);
        setCopied(status.code);
        window.setTimeout(() => setCopied(null), 1600);
    };

    return (
        <ToolLayout title="HTTP Status Codes" description="Search common HTTP status codes and copy response lines" category="web">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Find a status code" description="Search by code, phrase, use case, or status class.">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                        <ToolField label="Search" htmlFor="status-search">
                            <div className="flex h-11 items-center rounded-md border border-input bg-background px-3 shadow-sm focus-within:ring-1 focus-within:ring-ring">
                                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <input
                                    id="status-search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="404, rate limit, redirect..."
                                    className="min-w-0 flex-1 bg-transparent px-3 py-1 text-sm outline-none"
                                />
                            </div>
                        </ToolField>
                        <ToolSegmentedControl value={selectedClass} options={statusClassOptions} onChange={setSelectedClass} />
                    </div>
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Matches" value={filtered.length} />
                    <ToolMetric label="Reference size" value={statuses.length} />
                    <ToolMetric label="Selected class" value={<span className="text-base">{selectedClass.toUpperCase()}</span>} />
                </div>

                <ToolPanel title="Status reference">
                    {filtered.length === 0 ? (
                        <ToolEmptyState title="No status codes found" description="Try a different code, phrase, or status class." />
                    ) : (
                        <div className="divide-y divide-border">
                            {filtered.map((status) => (
                                <div key={status.code} className="grid gap-3 py-4 lg:grid-cols-[96px_1fr_auto] lg:items-start">
                                    <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">{status.code}</div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold text-foreground text-balance">{status.phrase}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground text-pretty">{status.meaning}</p>
                                        <p className="mt-2 text-sm text-foreground/80 text-pretty">Use for: {status.use}</p>
                                    </div>
                                    <button type="button" onClick={() => copyStatus(status)} className="btn btn-secondary h-8 gap-2 justify-self-start px-3 lg:justify-self-end">
                                        {copied === status.code ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                        {copied === status.code ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
