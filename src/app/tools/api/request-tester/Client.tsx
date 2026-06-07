'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, Play, RefreshCw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolField, ToolMetric, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

interface ResponseState {
    status: number;
    statusText: string;
    ok: boolean;
    duration: number;
    headers: Array<[string, string]>;
    body: string;
    contentType: string;
    url: string;
}

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

const sampleHeaders = `accept: application/json
content-type: application/json`;

function parseHeaderLines(input: string) {
    const headers = new Headers();
    const errors: string[] = [];

    input.split(/\r?\n/).forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const separator = trimmed.indexOf(':');
        if (separator <= 0) {
            errors.push(`Line ${index + 1} is missing a header name or colon.`);
            return;
        }
        headers.append(trimmed.slice(0, separator).trim(), trimmed.slice(separator + 1).trim());
    });

    return { headers, errors };
}

function formatBody(body: string, contentType: string) {
    if (!body) return '';
    if (contentType.includes('json')) {
        try {
            return JSON.stringify(JSON.parse(body), null, 2);
        } catch {
            return body;
        }
    }
    return body;
}

export default function ApiRequestTester() {
    const [method, setMethod] = useState<HttpMethod>('GET');
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
    const [headersText, setHeadersText] = useState('accept: application/json');
    const [body, setBody] = useState('{\n  "title": "UtilsHub test"\n}');
    const [includeCredentials, setIncludeCredentials] = useState(false);
    const [response, setResponse] = useState<ResponseState | null>(null);
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [copied, setCopied] = useState(false);

    const parsedHeaders = useMemo(() => parseHeaderLines(headersText), [headersText]);
    const canSendBody = !['GET', 'HEAD'].includes(method);
    const displayedBody = response ? formatBody(response.body, response.contentType) : '';

    const sendRequest = async () => {
        setError('');
        setCopied(false);
        setResponse(null);

        if (!url.trim()) {
            setError('Enter a request URL.');
            return;
        }

        if (parsedHeaders.errors.length > 0) {
            setError(parsedHeaders.errors.join(' '));
            return;
        }

        let requestUrl: URL;
        try {
            requestUrl = new URL(url.trim());
        } catch {
            setError('Enter a valid absolute URL, including http:// or https://.');
            return;
        }

        setIsSending(true);
        const startedAt = performance.now();

        try {
            const result = await fetch(requestUrl.toString(), {
                method,
                headers: parsedHeaders.headers,
                body: canSendBody && body.trim() ? body : undefined,
                credentials: includeCredentials ? 'include' : 'same-origin',
            });
            const responseText = method === 'HEAD' ? '' : await result.text();
            const duration = Math.round(performance.now() - startedAt);
            setResponse({
                status: result.status,
                statusText: result.statusText,
                ok: result.ok,
                duration,
                headers: Array.from(result.headers.entries()),
                body: responseText,
                contentType: result.headers.get('content-type') || '',
                url: result.url,
            });
        } catch (requestError) {
            setError(
                requestError instanceof TypeError
                    ? 'The browser blocked or could not reach this request. Check the URL, network access, HTTPS, and CORS policy.'
                    : requestError instanceof Error
                        ? requestError.message
                        : 'Unable to send this request.'
            );
        } finally {
            setIsSending(false);
        }
    };

    const copyBody = async () => {
        if (!displayedBody) return;
        await navigator.clipboard.writeText(displayedBody);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setMethod('GET');
        setUrl('');
        setHeadersText('');
        setBody('');
        setIncludeCredentials(false);
        setResponse(null);
        setError('');
        setCopied(false);
    };

    const loadSample = () => {
        setMethod('GET');
        setUrl('https://jsonplaceholder.typicode.com/todos/1');
        setHeadersText('accept: application/json');
        setBody('{\n  "title": "UtilsHub test"\n}');
        setIncludeCredentials(false);
        setResponse(null);
        setError('');
        setCopied(false);
    };

    return (
        <ToolLayout
            title="API Request Tester"
            description="Send browser-side HTTP requests and inspect response status, headers, and body"
            category="api"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Request">
                    <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
                        <ToolField label="Method" htmlFor="request-method">
                            <select
                                id="request-method"
                                value={method}
                                onChange={(event) => setMethod(event.target.value as HttpMethod)}
                                className="input h-11"
                            >
                                {methods.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </ToolField>
                        <ToolField label="URL" htmlFor="request-url">
                            <input
                                id="request-url"
                                value={url}
                                onChange={(event) => setUrl(event.target.value)}
                                placeholder="https://api.example.com/users"
                                className="input h-11 font-mono"
                                spellCheck={false}
                            />
                        </ToolField>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <ToolField label="Headers" description="One header per line, using name: value.">
                            <ToolTextarea
                                value={headersText}
                                onChange={(event) => setHeadersText(event.target.value)}
                                placeholder={sampleHeaders}
                                className="min-h-44"
                                spellCheck={false}
                            />
                        </ToolField>
                        <ToolField label="Body" description={canSendBody ? 'Sent as the raw request body.' : 'GET and HEAD requests do not send a body.'}>
                            <ToolTextarea
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                placeholder='{"name":"UtilsHub"}'
                                className="min-h-44"
                                disabled={!canSendBody}
                                spellCheck={false}
                            />
                        </ToolField>
                    </div>

                    <label className="mt-4 inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={includeCredentials}
                            onChange={(event) => setIncludeCredentials(event.target.checked)}
                            className="h-4 w-4 accent-current"
                        />
                        Include browser credentials
                    </label>
                </ToolPanel>

                <ToolActionBar className="justify-center">
                    <button type="button" onClick={sendRequest} disabled={isSending} className="btn btn-primary gap-2">
                        {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        {isSending ? 'Sending' : 'Send request'}
                    </button>
                    <button type="button" onClick={loadSample} className="btn btn-secondary gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Sample
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}
                {!error && <ToolStatus tone="info">Requests are sent directly from your browser to the target URL. CORS policies still apply.</ToolStatus>}

                {response ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-4">
                            <ToolMetric label="Status" value={response.status} description={response.statusText || 'No status text'} />
                            <ToolMetric label="Result" value={response.ok ? 'OK' : 'Error'} />
                            <ToolMetric label="Duration" value={`${response.duration}ms`} />
                            <ToolMetric label="Headers" value={response.headers.length} />
                        </div>

                        <ToolPanel title="Response body" description={response.url} actions={
                            <button type="button" onClick={copyBody} disabled={!displayedBody} className="btn btn-secondary h-8 gap-2 px-3">
                                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy body'}
                            </button>
                        }>
                            <pre className="min-h-44 overflow-x-auto whitespace-pre-wrap rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                                {displayedBody || 'No response body.'}
                            </pre>
                        </ToolPanel>

                        <ToolPanel title="Response headers">
                            {response.headers.length === 0 ? (
                                <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                                    No readable response headers were exposed to the browser.
                                </div>
                            ) : (
                                <div className="divide-y rounded-md border">
                                    {response.headers.map(([name, value]) => (
                                        <div key={name} className="grid gap-2 p-3 md:grid-cols-[260px_1fr]">
                                            <div className="break-all font-mono text-sm font-medium text-foreground">{name}</div>
                                            <div className="break-all font-mono text-sm text-muted-foreground">{value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ToolPanel>
                    </>
                ) : (
                    <ToolPanel title="Response">
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Send a request to inspect the response status, headers, and body.
                        </div>
                    </ToolPanel>
                )}
            </div>
        </ToolLayout>
    );
}
