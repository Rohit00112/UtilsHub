'use client';

import { useCallback, useEffect, useState } from 'react';
import * as Diff from 'diff';
import { Eraser } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolEmptyState, ToolPanel, ToolSegmentedControl, ToolTextarea } from '@/components/tools/ToolPrimitives';

type DiffMode = 'chars' | 'words' | 'lines';

export default function TextDiffChecker() {
    const [originalText, setOriginalText] = useState('');
    const [modifiedText, setModifiedText] = useState('');
    const [diffResult, setDiffResult] = useState<Diff.Change[]>([]);
    const [diffMode, setDiffMode] = useState<DiffMode>('words');

    const calculateDiff = useCallback(() => {
        if (!originalText && !modifiedText) {
            setDiffResult([]);
            return;
        }

        if (diffMode === 'chars') setDiffResult(Diff.diffChars(originalText, modifiedText));
        else if (diffMode === 'lines') setDiffResult(Diff.diffLines(originalText, modifiedText));
        else setDiffResult(Diff.diffWords(originalText, modifiedText));
    }, [diffMode, modifiedText, originalText]);

    useEffect(() => {
        calculateDiff();
    }, [calculateDiff]);

    const clearAll = () => {
        setOriginalText('');
        setModifiedText('');
    };

    return (
        <ToolLayout
            title="Text Diff Checker"
            description="Compare two texts and highlight differences instantly"
            category="special"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Compare settings">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <ToolSegmentedControl
                            value={diffMode}
                            onChange={setDiffMode}
                            options={[
                                { label: 'Characters', value: 'chars' },
                                { label: 'Words', value: 'words' },
                                { label: 'Lines', value: 'lines' },
                            ]}
                        />
                        <button onClick={clearAll} className="btn btn-secondary gap-2">
                            <Eraser className="h-4 w-4" />
                            Clear all
                        </button>
                    </div>
                </ToolPanel>

                <div className="grid gap-4 md:grid-cols-2">
                    <ToolPanel title="Original text">
                        <ToolTextarea
                            className="min-h-[320px]"
                            placeholder="Paste original text here"
                            value={originalText}
                            onChange={(event) => setOriginalText(event.target.value)}
                        />
                    </ToolPanel>
                    <ToolPanel title="Modified text">
                        <ToolTextarea
                            className="min-h-[320px]"
                            placeholder="Paste modified text here"
                            value={modifiedText}
                            onChange={(event) => setModifiedText(event.target.value)}
                        />
                    </ToolPanel>
                </div>

                <ToolPanel title="Differences">
                    {diffResult.length > 0 ? (
                        <div className="rounded-md border bg-muted/20 p-4 font-mono text-sm leading-6 whitespace-pre-wrap break-words">
                            {diffResult.map((part, index) => {
                                const color = part.added
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : part.removed
                                        ? 'bg-destructive/10 text-destructive line-through decoration-destructive/60'
                                        : 'text-foreground';
                                return (
                                    <span key={index} className={`${color} rounded px-0.5`}>
                                        {part.value}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <ToolEmptyState title="No differences yet" description="Enter text in either panel to see a comparison." />
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
