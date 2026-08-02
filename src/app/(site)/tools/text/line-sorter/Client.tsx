'use client';

import { useState } from 'react';
import { ArrowUpDown, Check, Clipboard, Eraser, ListOrdered } from 'lucide-react';
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

type SortMode = 'natural' | 'alphabetical' | 'length' | 'numeric';
type SortDirection = 'asc' | 'desc';

interface SortMeta {
    inputLines: number;
    outputLines: number;
    removedLines: number;
}

const sortModeOptions: Array<{ label: string; value: SortMode }> = [
    { label: 'Natural', value: 'natural' },
    { label: 'A-Z', value: 'alphabetical' },
    { label: 'Length', value: 'length' },
    { label: 'Number', value: 'numeric' },
];

const directionOptions: Array<{ label: string; value: SortDirection }> = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
];

const sampleText = [
    'invoice-12.pdf',
    'invoice-3.pdf',
    'Invoice-1.pdf',
    'notes',
    '  archive',
    'invoice-3.pdf',
].join('\n');

function numericValue(text: string) {
    const match = text.match(/[-+]?(?:\d+\.?\d*|\.\d+)/);
    return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

function sortKey(line: string, trimWhitespace: boolean, caseSensitive: boolean) {
    const value = trimWhitespace ? line.trim() : line;
    return caseSensitive ? value : value.toLocaleLowerCase();
}

export default function LineSorter() {
    const [input, setInput] = useToolState('line-sorter', 'input', sampleText);
    const [output, setOutput] = useToolState('line-sorter', 'output', '');
    const [sortMode, setSortMode] = useToolState<SortMode>('line-sorter', 'sortMode', 'natural');
    const [direction, setDirection] = useToolState<SortDirection>('line-sorter', 'direction', 'asc');
    const [caseSensitive, setCaseSensitive] = useToolState('line-sorter', 'caseSensitive', false);
    const [trimWhitespace, setTrimWhitespace] = useToolState('line-sorter', 'trimWhitespace', true);
    const [removeEmpty, setRemoveEmpty] = useToolState('line-sorter', 'removeEmpty', true);
    const [removeDuplicates, setRemoveDuplicates] = useToolState('line-sorter', 'removeDuplicates', false);
    const [copied, setCopied] = useState(false);
    const [meta, setMeta] = useToolState<SortMeta | null>('line-sorter', 'meta', null);

    const sortLines = () => {
        const inputLines = input.length === 0 ? [] : input.split(/\r?\n/);
        const collator = new Intl.Collator(undefined, {
            numeric: sortMode === 'natural',
            sensitivity: caseSensitive ? 'variant' : 'base',
        });

        let lines = inputLines
            .map((line, index) => ({ line, index }))
            .filter((item) => !removeEmpty || item.line.trim() !== '');

        if (removeDuplicates) {
            const seen = new Set<string>();
            lines = lines.filter((item) => {
                const key = sortKey(item.line, trimWhitespace, caseSensitive);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }

        lines.sort((a, b) => {
            const aKey = sortKey(a.line, trimWhitespace, caseSensitive);
            const bKey = sortKey(b.line, trimWhitespace, caseSensitive);
            let result = 0;

            if (sortMode === 'length') {
                result = aKey.length - bKey.length || collator.compare(aKey, bKey);
            } else if (sortMode === 'numeric') {
                result = numericValue(aKey) - numericValue(bKey) || collator.compare(aKey, bKey);
            } else {
                result = collator.compare(aKey, bKey);
            }

            if (result === 0) result = a.index - b.index;
            return direction === 'asc' ? result : -result;
        });

        setOutput(lines.map((item) => item.line).join('\n'));
        setMeta({
            inputLines: inputLines.length,
            outputLines: lines.length,
            removedLines: inputLines.length - lines.length,
        });
        setCopied(false);
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setMeta(null);
        setCopied(false);
    };

    const copyOutput = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    return (
        <ToolLayout title="Line Sorter" description="Sort text lines by natural order, alphabet, length, or number" category="text">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel
                    title="Sort settings"
                    actions={<ToolSegmentedControl value={sortMode} options={sortModeOptions} onChange={setSortMode} />}
                >
                    <div className="flex flex-wrap gap-4">
                        <ToolField label="Direction">
                            <ToolSegmentedControl value={direction} options={directionOptions} onChange={setDirection} />
                        </ToolField>
                        <label className="inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={caseSensitive}
                                onChange={(event) => setCaseSensitive(event.target.checked)}
                                className="h-4 w-4 accent-current"
                            />
                            Case sensitive
                        </label>
                        <label className="inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={trimWhitespace}
                                onChange={(event) => setTrimWhitespace(event.target.checked)}
                                className="h-4 w-4 accent-current"
                            />
                            Trim before sorting
                        </label>
                        <label className="inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={removeEmpty}
                                onChange={(event) => setRemoveEmpty(event.target.checked)}
                                className="h-4 w-4 accent-current"
                            />
                            Remove empty lines
                        </label>
                        <label className="inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={removeDuplicates}
                                onChange={(event) => setRemoveDuplicates(event.target.checked)}
                                className="h-4 w-4 accent-current"
                            />
                            Remove duplicates
                        </label>
                    </div>
                </ToolPanel>

                <div className="grid gap-6 lg:grid-cols-2">
                    <ToolPanel title="Input lines">
                        <ToolTextarea
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Paste one item per line..."
                            className="min-h-96"
                        />
                    </ToolPanel>

                    <ToolPanel
                        title="Sorted output"
                        actions={output && (
                            <button type="button" onClick={copyOutput} className="btn btn-secondary gap-2">
                                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        )}
                    >
                        <ToolTextarea value={output} readOnly placeholder="Sorted lines will appear here..." className="min-h-96" />
                    </ToolPanel>
                </div>

                <ToolActionBar>
                    <button type="button" onClick={sortLines} className="btn btn-primary gap-2">
                        <ListOrdered className="h-4 w-4" />
                        Sort lines
                    </button>
                    <button type="button" onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')} className="btn btn-secondary gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        Flip direction
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                {copied && <ToolStatus tone="success">Sorted output copied to clipboard.</ToolStatus>}

                {meta && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <ToolMetric label="Input lines" value={meta.inputLines} />
                        <ToolMetric label="Output lines" value={meta.outputLines} />
                        <ToolMetric label="Removed" value={meta.removedLines} />
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
