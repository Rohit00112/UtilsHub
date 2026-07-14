'use client';

import { useMemo, useState } from 'react';
import * as Diff from 'diff';
import { ArrowLeftRight, Check, Clipboard, Eraser, GitCompare } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';

function sortJson(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortJson);
    }

    if (value && typeof value === 'object') {
        return Object.keys(value as Record<string, unknown>)
            .sort((a, b) => a.localeCompare(b))
            .reduce<Record<string, unknown>>((sorted, key) => {
                sorted[key] = sortJson((value as Record<string, unknown>)[key]);
                return sorted;
            }, {});
    }

    return value;
}

function parseAndFormat(input: string) {
    try {
        const parsed = JSON.parse(input);
        return {
            formatted: JSON.stringify(sortJson(parsed), null, 2),
            error: '',
        };
    } catch (error) {
        return {
            formatted: '',
            error: error instanceof Error ? error.message : 'Invalid JSON.',
        };
    }
}

export default function JsonDiffViewer() {
    const [leftJson, setLeftJson] = useState('');
    const [rightJson, setRightJson] = useState('');
    const [diffResult, setDiffResult] = useState<Diff.Change[] | null>(null);
    const [leftError, setLeftError] = useState('');
    const [rightError, setRightError] = useState('');
    const [copied, setCopied] = useState(false);

    const stats = useMemo(() => {
        if (!diffResult) return null;
        return diffResult.reduce(
            (total, part) => {
                const lines = part.value.split('\n').filter((line) => line.length > 0).length;
                if (part.added) total.added += lines;
                else if (part.removed) total.removed += lines;
                else total.unchanged += lines;
                return total;
            },
            { added: 0, removed: 0, unchanged: 0 }
        );
    }, [diffResult]);

    const compareJson = () => {
        const left = parseAndFormat(leftJson);
        const right = parseAndFormat(rightJson);

        setLeftError(left.error);
        setRightError(right.error);
        setCopied(false);

        if (left.error || right.error) {
            setDiffResult(null);
            return;
        }

        setDiffResult(Diff.diffLines(`${left.formatted}\n`, `${right.formatted}\n`));
    };

    const swapJson = () => {
        setLeftJson(rightJson);
        setRightJson(leftJson);
        setLeftError('');
        setRightError('');
        setDiffResult(null);
        setCopied(false);
    };

    const clearAll = () => {
        setLeftJson('');
        setRightJson('');
        setLeftError('');
        setRightError('');
        setDiffResult(null);
        setCopied(false);
    };

    const copyResult = async () => {
        if (!diffResult) return;

        const text = diffResult
            .map((part) => {
                const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
                return part.value
                    .split('\n')
                    .filter((line) => line.length > 0)
                    .map((line) => `${prefix}${line}`)
                    .join('\n');
            })
            .filter(Boolean)
            .join('\n');

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            setLeftError('');
            setRightError('Clipboard access was blocked by the browser.');
        }
    };

    return (
        <ToolLayout
            title="JSON Diff Viewer"
            description="Compare two JSON objects with stable key sorting and highlighted changes"
            category="developer"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    <ToolPanel title="Original JSON">
                        <ToolTextarea
                            value={leftJson}
                            onChange={(event) => setLeftJson(event.target.value)}
                            placeholder='{"name":"FreeWebTools","tools":["json","diff"]}'
                            className="min-h-[380px]"
                            spellCheck={false}
                        />
                        {leftError && <ToolStatus tone="error" className="mt-3">Original JSON: {leftError}</ToolStatus>}
                    </ToolPanel>

                    <ToolPanel title="Changed JSON">
                        <ToolTextarea
                            value={rightJson}
                            onChange={(event) => setRightJson(event.target.value)}
                            placeholder='{"name":"FreeWebTools","tools":["json","diff","parser"]}'
                            className="min-h-[380px]"
                            spellCheck={false}
                        />
                        {rightError && <ToolStatus tone="error" className="mt-3">Changed JSON: {rightError}</ToolStatus>}
                    </ToolPanel>
                </div>

                <ToolActionBar className="justify-center">
                    <button onClick={compareJson} className="btn btn-primary gap-2">
                        <GitCompare className="h-4 w-4" />
                        Compare
                    </button>
                    <button onClick={swapJson} className="btn btn-secondary gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        Swap
                    </button>
                    <button onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                <ToolPanel
                    title="Diff result"
                    description={
                        stats
                            ? `${stats.added} added lines, ${stats.removed} removed lines, ${stats.unchanged} unchanged lines`
                            : 'Valid JSON on both sides is normalized before comparison.'
                    }
                    actions={
                        <button onClick={copyResult} disabled={!diffResult} className="btn btn-secondary h-8 gap-2 px-3">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy result'}
                        </button>
                    }
                >
                    {!diffResult ? (
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Paste two JSON documents and compare them to see normalized differences.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border bg-muted/30 p-4 font-mono text-sm">
                            <div className="min-w-full whitespace-pre-wrap">
                                {diffResult.map((part, index) => {
                                    let className = 'text-foreground';
                                    if (part.added) {
                                        className = 'block bg-emerald-500/20 text-emerald-700 dark:text-emerald-300';
                                    } else if (part.removed) {
                                        className = 'block bg-destructive/20 text-destructive line-through decoration-destructive/50';
                                    }

                                    return (
                                        <span key={index} className={className}>
                                            {part.value}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
