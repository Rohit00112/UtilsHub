'use client';

import * as Diff from 'diff';
import { Eraser, GitCompare } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const textareaClass = 'h-80 w-full rounded-md border border-input bg-background px-4 py-3 font-mono text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring';

export default function DiffChecker() {
    const [original, setOriginal] = useToolState('diff-checker', 'original', '');
    const [changed, setChanged] = useToolState('diff-checker', 'changed', '');
    const [diffResult, setDiffResult] = useToolState<Diff.Change[] | null>('diff-checker', 'diffResult', null);

    const compareText = () => {
        setDiffResult(Diff.diffLines(original, changed));
    };

    const clearText = () => {
        setOriginal('');
        setChanged('');
        setDiffResult(null);
    };

    return (
        <ToolLayout
            title="Text Diff Checker"
            description="Compare two blocks of text and highlight the differences"
            category="text"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <ToolPanel title="Original text">
                        <textarea
                            id="original"
                            className={textareaClass}
                            value={original}
                            onChange={(event) => setOriginal(event.target.value)}
                            placeholder="Paste original text here..."
                        />
                    </ToolPanel>

                    <ToolPanel title="Changed text">
                        <textarea
                            id="changed"
                            className={textareaClass}
                            value={changed}
                            onChange={(event) => setChanged(event.target.value)}
                            placeholder="Paste changed text here..."
                        />
                    </ToolPanel>
                </div>

                <ToolActionBar className="justify-center">
                    <button onClick={compareText} className="btn btn-primary gap-2">
                        <GitCompare className="h-4 w-4" />
                        Compare
                    </button>
                    <button onClick={clearText} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                {diffResult && (
                    <ToolPanel title="Comparison result">
                        <div className="overflow-x-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-mono text-sm">
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
                    </ToolPanel>
                )}
            </div>
        </ToolLayout>
    );
}
