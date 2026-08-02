'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, Link2, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const defaultUrl = 'https://example.com/launch?ref=homepage';

function ensureUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) throw new Error('Enter a destination URL.');
    try {
        return new URL(trimmed);
    } catch {
        return new URL(`https://${trimmed}`);
    }
}

function parseCustomParams(value: string) {
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [key, ...rest] = line.split('=');
            return [key.trim(), rest.join('=').trim()] as const;
        })
        .filter(([key]) => key.length > 0);
}

export default function UtmBuilder() {
    const [baseUrl, setBaseUrl] = useToolState('utm-builder', 'baseUrl', defaultUrl);
    const [source, setSource] = useToolState('utm-builder', 'source', 'newsletter');
    const [medium, setMedium] = useToolState('utm-builder', 'medium', 'email');
    const [campaign, setCampaign] = useToolState('utm-builder', 'campaign', 'spring_launch');
    const [term, setTerm] = useToolState('utm-builder', 'term', '');
    const [content, setContent] = useToolState('utm-builder', 'content', '');
    const [customParams, setCustomParams] = useToolState('utm-builder', 'customParams', 'audience=beta\nvariant=hero-a');
    const [copied, setCopied] = useState(false);

    const result = useMemo(() => {
        try {
            const url = ensureUrl(baseUrl);
            const utmPairs = [
                ['utm_source', source],
                ['utm_medium', medium],
                ['utm_campaign', campaign],
                ['utm_term', term],
                ['utm_content', content],
            ];

            utmPairs.forEach(([key, value]) => {
                const trimmed = value.trim();
                if (trimmed) url.searchParams.set(key, trimmed);
                else url.searchParams.delete(key);
            });

            parseCustomParams(customParams).forEach(([key, value]) => {
                url.searchParams.set(key, value);
            });

            return { url: url.toString(), error: '', count: Array.from(url.searchParams.keys()).length };
        } catch (error) {
            return {
                url: '',
                error: error instanceof Error ? error.message : 'Unable to build this URL.',
                count: 0,
            };
        }
    }, [baseUrl, campaign, content, customParams, medium, source, term]);

    const copyUrl = async () => {
        await navigator.clipboard.writeText(result.url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setBaseUrl('');
        setSource('');
        setMedium('');
        setCampaign('');
        setTerm('');
        setContent('');
        setCustomParams('');
        setCopied(false);
    };

    const loadSample = () => {
        setBaseUrl(defaultUrl);
        setSource('newsletter');
        setMedium('email');
        setCampaign('spring_launch');
        setTerm('');
        setContent('');
        setCustomParams('audience=beta\nvariant=hero-a');
        setCopied(false);
    };

    return (
        <ToolLayout title="UTM Builder" description="Build campaign URLs with UTM and custom query parameters" category="web">
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel title="Destination">
                    <ToolField label="Base URL" htmlFor="base-url" description="Existing query parameters are preserved.">
                        <input
                            id="base-url"
                            value={baseUrl}
                            onChange={(event) => {
                                setBaseUrl(event.target.value);
                                setCopied(false);
                            }}
                            placeholder="https://example.com/page"
                            className="input h-11 font-mono"
                        />
                    </ToolField>
                </ToolPanel>

                <ToolPanel title="Campaign parameters">
                    <div className="grid gap-4 md:grid-cols-2">
                        <TextInput label="Source" value={source} onChange={setSource} placeholder="newsletter" />
                        <TextInput label="Medium" value={medium} onChange={setMedium} placeholder="email" />
                        <TextInput label="Campaign" value={campaign} onChange={setCampaign} placeholder="spring_launch" />
                        <TextInput label="Term" value={term} onChange={setTerm} placeholder="running+shoes" />
                        <TextInput label="Content" value={content} onChange={setContent} placeholder="hero_cta" />
                    </div>
                </ToolPanel>

                <ToolPanel title="Custom parameters" description="Optional key=value pairs, one per line.">
                    <ToolTextarea
                        value={customParams}
                        onChange={(event) => setCustomParams(event.target.value)}
                        placeholder={'audience=beta\nvariant=hero-a'}
                        className="min-h-36"
                    />
                </ToolPanel>

                {result.error && <ToolStatus tone="error">{result.error}</ToolStatus>}

                <ToolActionBar>
                    <button type="button" onClick={copyUrl} disabled={!result.url} className="btn btn-primary gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy URL'}
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

                <ToolPanel title="Campaign URL">
                    <div className="rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                        {result.url ? (
                            <span className="break-all">{result.url}</span>
                        ) : (
                            <span className="text-muted-foreground">Generated URL will appear here...</span>
                        )}
                    </div>
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Query parameters" value={result.count} />
                    <ToolMetric label="URL length" value={result.url.length} />
                    <ToolMetric
                        label="Protocol"
                        value={<span className="flex min-w-0 items-center gap-2 text-base"><Link2 className="h-4 w-4 shrink-0" />{result.url ? new URL(result.url).protocol.replace(':', '') : 'none'}</span>}
                    />
                </div>
            </div>
        </ToolLayout>
    );
}

function TextInput({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    return (
        <ToolField label={label}>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="input h-10 font-mono"
            />
        </ToolField>
    );
}
