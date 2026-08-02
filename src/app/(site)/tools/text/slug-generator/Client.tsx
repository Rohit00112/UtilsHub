'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, Link2, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type Separator = '-' | '_';
type CaseMode = 'lower' | 'preserve';

const separatorOptions: Array<{ label: string; value: Separator }> = [
    { label: 'Dash', value: '-' },
    { label: 'Underscore', value: '_' },
];

const caseOptions: Array<{ label: string; value: CaseMode }> = [
    { label: 'Lowercase', value: 'lower' },
    { label: 'Preserve', value: 'preserve' },
];

const stopWords = new Set([
    'a',
    'an',
    'and',
    'as',
    'at',
    'but',
    'by',
    'for',
    'from',
    'in',
    'into',
    'of',
    'on',
    'or',
    'the',
    'to',
    'with',
]);

function normalizeText(value: string) {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function trimToWordBoundary(value: string, maxLength: number, separator: Separator) {
    if (value.length <= maxLength) return value;
    const sliced = value.slice(0, maxLength);
    const lastSeparator = sliced.lastIndexOf(separator);
    if (lastSeparator > 0 && lastSeparator >= Math.floor(maxLength * 0.65)) {
        return sliced.slice(0, lastSeparator);
    }
    return sliced;
}

function buildSlug({
    input,
    separator,
    caseMode,
    removeStopWords,
    maxLength,
}: {
    input: string;
    separator: Separator;
    caseMode: CaseMode;
    removeStopWords: boolean;
    maxLength: number;
}) {
    const normalized = normalizeText(input.trim());
    const cased = caseMode === 'lower' ? normalized.toLowerCase() : normalized;
    const words = cased
        .replace(/['’]/g, '')
        .replace(/&/g, ' and ')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .filter((word) => !removeStopWords || !stopWords.has(word.toLowerCase()));

    const joined = words.join(separator);
    const trimmed = trimToWordBoundary(joined, maxLength, separator);
    return trimmed.replace(new RegExp(`${separator}+`, 'g'), separator).replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
}

const sampleTitle = 'The Practical Guide to Browser-Local Utility Tools';

export default function SlugGenerator() {
    const [input, setInput] = useToolState('slug-generator', 'input', sampleTitle);
    const [separator, setSeparator] = useToolState<Separator>('slug-generator', 'separator', '-');
    const [caseMode, setCaseMode] = useToolState<CaseMode>('slug-generator', 'caseMode', 'lower');
    const [removeStopWords, setRemoveStopWords] = useToolState('slug-generator', 'removeStopWords', false);
    const [maxLength, setMaxLength] = useToolState('slug-generator', 'maxLength', '80');
    const [copied, setCopied] = useState(false);

    const parsedMaxLength = Number.parseInt(maxLength, 10);
    const effectiveMaxLength = Number.isFinite(parsedMaxLength)
        ? Math.min(Math.max(parsedMaxLength, 8), 200)
        : 80;

    const slug = useMemo(() => buildSlug({
        input,
        separator,
        caseMode,
        removeStopWords,
        maxLength: effectiveMaxLength,
    }), [caseMode, effectiveMaxLength, input, removeStopWords, separator]);

    const words = input.trim().split(/\s+/).filter(Boolean).length;

    const copySlug = async () => {
        await navigator.clipboard.writeText(slug);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setInput('');
        setCopied(false);
    };

    const loadSample = () => {
        setInput(sampleTitle);
        setCopied(false);
    };

    return (
        <ToolLayout title="Slug Generator" description="Turn titles, headings, or filenames into clean URL slugs" category="text">
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel title="Slug settings" description="Choose how aggressively the title should be cleaned up.">
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        <ToolField label="Separator">
                            <ToolSegmentedControl value={separator} options={separatorOptions} onChange={setSeparator} />
                        </ToolField>
                        <ToolField label="Case">
                            <ToolSegmentedControl value={caseMode} options={caseOptions} onChange={setCaseMode} />
                        </ToolField>
                        <ToolField label="Maximum length" htmlFor="max-length">
                            <input
                                id="max-length"
                                type="number"
                                min="8"
                                max="200"
                                value={maxLength}
                                onChange={(event) => setMaxLength(event.target.value)}
                                className="input h-10"
                            />
                        </ToolField>
                        <label className="inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground md:self-end">
                            <input
                                type="checkbox"
                                checked={removeStopWords}
                                onChange={(event) => setRemoveStopWords(event.target.checked)}
                                className="h-4 w-4 accent-current"
                            />
                            Remove stop words
                        </label>
                    </div>
                </ToolPanel>

                <ToolPanel title="Input text">
                    <ToolTextarea
                        value={input}
                        onChange={(event) => {
                            setInput(event.target.value);
                            setCopied(false);
                        }}
                        placeholder="Paste a title, heading, filename, or product name..."
                        className="min-h-52"
                    />
                </ToolPanel>

                <ToolActionBar>
                    <button type="button" onClick={copySlug} disabled={!slug} className="btn btn-primary gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy slug'}
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

                <ToolPanel title="Generated slug">
                    <div className="rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                        {slug || <span className="text-muted-foreground">Slug will appear here...</span>}
                    </div>
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Input words" value={words} />
                    <ToolMetric label="Slug length" value={slug.length} />
                    <ToolMetric
                        label="Preview path"
                        value={<span className="flex min-w-0 items-center gap-2 text-base"><Link2 className="h-4 w-4 shrink-0" /><span className="truncate">/{slug || 'slug'}</span></span>}
                    />
                </div>
            </div>
        </ToolLayout>
    );
}
