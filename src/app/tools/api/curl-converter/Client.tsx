'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolMetric, ToolPanel, ToolSegmentedControl, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';

type OutputMode = 'fetch' | 'axios' | 'python';

interface ParsedCurl {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
    auth: string;
    warnings: string[];
}

const sampleCurl = `curl -X POST https://api.example.com/users \\
  -H "Authorization: Bearer token" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"FreeWebTools","role":"tester"}'`;

function tokenize(input: string) {
    const normalized = input.replace(/\\\r?\n/g, ' ');
    const tokens: string[] = [];
    let current = '';
    let quote: '"' | "'" | null = null;
    let escaped = false;

    for (const char of normalized) {
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }

        if (char === '\\' && quote !== "'") {
            escaped = true;
            continue;
        }

        if ((char === '"' || char === "'") && !quote) {
            quote = char;
            continue;
        }

        if (char === quote) {
            quote = null;
            continue;
        }

        if (/\s/.test(char) && !quote) {
            if (current) {
                tokens.push(current);
                current = '';
            }
            continue;
        }

        current += char;
    }

    if (current) tokens.push(current);
    if (quote) throw new Error('The cURL command has an unclosed quote.');
    return tokens;
}

function splitFlag(token: string) {
    const equalIndex = token.indexOf('=');
    if (equalIndex === -1) return [token, ''] as const;
    return [token.slice(0, equalIndex), token.slice(equalIndex + 1)] as const;
}

function parseCurl(input: string): ParsedCurl {
    const tokens = tokenize(input.trim());
    if (tokens.length === 0) throw new Error('Paste a cURL command.');
    if (tokens[0] === 'curl') tokens.shift();

    const parsed: ParsedCurl = {
        method: 'GET',
        url: '',
        headers: {},
        body: '',
        auth: '',
        warnings: [],
    };

    const readValue = (index: number, inlineValue: string, flag: string) => {
        if (inlineValue) return { value: inlineValue, nextIndex: index };
        const value = tokens[index + 1];
        if (!value) throw new Error(`${flag} is missing a value.`);
        return { value, nextIndex: index + 1 };
    };

    for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i];
        const [flag, inlineValue] = splitFlag(token);

        if (flag === '-X' || flag === '--request') {
            const next = readValue(i, inlineValue, flag);
            parsed.method = next.value.toUpperCase();
            i = next.nextIndex;
            continue;
        }

        if (flag === '-H' || flag === '--header') {
            const next = readValue(i, inlineValue, flag);
            const separator = next.value.indexOf(':');
            if (separator > 0) {
                parsed.headers[next.value.slice(0, separator).trim()] = next.value.slice(separator + 1).trim();
            } else {
                parsed.warnings.push(`Skipped malformed header: ${next.value}`);
            }
            i = next.nextIndex;
            continue;
        }

        if (['-d', '--data', '--data-raw', '--data-binary', '--data-ascii', '--data-urlencode'].includes(flag)) {
            const next = readValue(i, inlineValue, flag);
            parsed.body = parsed.body ? `${parsed.body}&${next.value}` : next.value;
            if (parsed.method === 'GET') parsed.method = 'POST';
            i = next.nextIndex;
            continue;
        }

        if (flag === '--url') {
            const next = readValue(i, inlineValue, flag);
            parsed.url = next.value;
            i = next.nextIndex;
            continue;
        }

        if (flag === '-u' || flag === '--user') {
            const next = readValue(i, inlineValue, flag);
            parsed.auth = next.value;
            i = next.nextIndex;
            continue;
        }

        if (flag === '-I' || flag === '--head') {
            parsed.method = 'HEAD';
            continue;
        }

        if (flag === '-G' || flag === '--get') {
            parsed.method = 'GET';
            continue;
        }

        if (token.startsWith('-')) {
            parsed.warnings.push(`Flag ${token} is not converted.`);
            continue;
        }

        if (!parsed.url) parsed.url = token;
    }

    if (!parsed.url) throw new Error('Could not find a URL in this cURL command.');
    if (parsed.auth && !parsed.headers.Authorization) {
        parsed.headers.Authorization = `Basic ${parsed.auth}`;
        parsed.warnings.push('Basic auth was preserved as a placeholder Authorization header; encode credentials before using in production.');
    }

    return parsed;
}

function jsObjectLiteral(value: Record<string, string>) {
    return JSON.stringify(value, null, 2).replace(/"([^"]+)":/g, '$1:');
}

function generateFetch(parsed: ParsedCurl) {
    const options = [
        `method: ${JSON.stringify(parsed.method)}`,
        Object.keys(parsed.headers).length > 0 ? `headers: ${jsObjectLiteral(parsed.headers)}` : '',
        parsed.body ? `body: ${JSON.stringify(parsed.body)}` : '',
    ].filter(Boolean);

    return `const response = await fetch(${JSON.stringify(parsed.url)}, {
  ${options.join(',\n  ')}
});

const data = await response.text();
console.log(response.status, data);`;
}

function generateAxios(parsed: ParsedCurl) {
    const config = [
        `method: ${JSON.stringify(parsed.method.toLowerCase())}`,
        `url: ${JSON.stringify(parsed.url)}`,
        Object.keys(parsed.headers).length > 0 ? `headers: ${jsObjectLiteral(parsed.headers)}` : '',
        parsed.body ? `data: ${JSON.stringify(parsed.body)}` : '',
    ].filter(Boolean);

    return `import axios from 'axios';

const response = await axios({
  ${config.join(',\n  ')}
});

console.log(response.status, response.data);`;
}

function generatePython(parsed: ParsedCurl) {
    const headers = JSON.stringify(parsed.headers, null, 4);
    const args = [
        JSON.stringify(parsed.method),
        JSON.stringify(parsed.url),
        Object.keys(parsed.headers).length > 0 ? `headers=${headers}` : '',
        parsed.body ? `data=${JSON.stringify(parsed.body)}` : '',
    ].filter(Boolean);

    return `import requests

response = requests.request(
    ${args.join(',\n    ')}
)

print(response.status_code)
print(response.text)`;
}

function generateCode(parsed: ParsedCurl, mode: OutputMode) {
    if (mode === 'axios') return generateAxios(parsed);
    if (mode === 'python') return generatePython(parsed);
    return generateFetch(parsed);
}

export default function CurlConverter() {
    const [curl, setCurl] = useState(sampleCurl);
    const [mode, setMode] = useState<OutputMode>('fetch');
    const [copied, setCopied] = useState(false);

    const result = useMemo(() => {
        try {
            const parsed = parseCurl(curl);
            return {
                parsed,
                code: generateCode(parsed, mode),
                error: '',
            };
        } catch (error) {
            return {
                parsed: null,
                code: '',
                error: error instanceof Error ? error.message : 'Unable to parse this cURL command.',
            };
        }
    }, [curl, mode]);

    const copyCode = async () => {
        if (!result.code) return;
        await navigator.clipboard.writeText(result.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setCurl('');
        setCopied(false);
    };

    const loadSample = () => {
        setCurl(sampleCurl);
        setCopied(false);
    };

    return (
        <ToolLayout
            title="cURL to Code Converter"
            description="Convert common cURL commands into fetch, Axios, or Python requests"
            category="api"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="cURL command" description="Supports common URL, method, header, data, HEAD, GET, and basic auth flags.">
                    <ToolTextarea
                        value={curl}
                        onChange={(event) => {
                            setCurl(event.target.value);
                            setCopied(false);
                        }}
                        placeholder="curl https://api.example.com -H 'Accept: application/json'"
                        className="min-h-[260px]"
                        spellCheck={false}
                    />
                </ToolPanel>

                <ToolActionBar className="justify-between">
                    <ToolSegmentedControl
                        value={mode}
                        onChange={setMode}
                        options={[
                            { label: 'fetch', value: 'fetch' },
                            { label: 'Axios', value: 'axios' },
                            { label: 'Python', value: 'python' },
                        ]}
                    />
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={loadSample} className="btn btn-secondary gap-2">
                            <Wand2 className="h-4 w-4" />
                            Sample
                        </button>
                        <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                            <Eraser className="h-4 w-4" />
                            Clear
                        </button>
                    </div>
                </ToolActionBar>

                {result.error && <ToolStatus tone="error">{result.error}</ToolStatus>}
                {result.parsed?.warnings.map((warning) => (
                    <ToolStatus key={warning} tone="warning">{warning}</ToolStatus>
                ))}

                {result.parsed && (
                    <div className="grid gap-4 sm:grid-cols-4">
                        <ToolMetric label="Method" value={result.parsed.method} />
                        <ToolMetric label="Headers" value={Object.keys(result.parsed.headers).length} />
                        <ToolMetric label="Body" value={result.parsed.body ? 'Yes' : 'No'} />
                        <ToolMetric label="Output" value={mode} />
                    </div>
                )}

                <ToolPanel
                    title="Generated code"
                    description={result.parsed?.url}
                    actions={
                        <button type="button" onClick={copyCode} disabled={!result.code} className="btn btn-secondary h-8 gap-2 px-3">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy code'}
                        </button>
                    }
                >
                    <pre className="min-h-[320px] overflow-x-auto whitespace-pre-wrap rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                        {result.code || 'Converted code will appear here.'}
                    </pre>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
