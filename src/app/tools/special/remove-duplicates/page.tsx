'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clipboard, Eraser } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolMetric, ToolPanel, ToolTextarea } from '@/components/tools/ToolPrimitives';

export default function RemoveDuplicates() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
    const [stats, setStats] = useState({ original: 0, unique: 0, removed: 0 });

    const processText = useCallback(() => {
        if (!inputText) {
            setOutputText('');
            setStats({ original: 0, unique: 0, removed: 0 });
            return;
        }

        const lines = inputText.split('\n');
        const uniqueLines = new Set<string>();
        const result: string[] = [];

        lines.forEach((line) => {
            let comparisonLine = ignoreWhitespace ? line.trim() : line;
            if (!caseSensitive) comparisonLine = comparisonLine.toLowerCase();

            if (!uniqueLines.has(comparisonLine)) {
                uniqueLines.add(comparisonLine);
                result.push(ignoreWhitespace ? line.trim() : line);
            }
        });

        setOutputText(result.join('\n'));
        setStats({
            original: lines.length,
            unique: result.length,
            removed: lines.length - result.length,
        });
    }, [caseSensitive, ignoreWhitespace, inputText]);

    useEffect(() => {
        processText();
    }, [processText]);

    const clearAll = () => {
        setInputText('');
    };

    return (
        <ToolLayout
            title="Remove Duplicate Lines"
            description="Clean up text lists by removing repeated lines instantly"
            category="special"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Options">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-4">
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={caseSensitive}
                                    onChange={(event) => setCaseSensitive(event.target.checked)}
                                    className="h-4 w-4 rounded border-border"
                                />
                                Case sensitive
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={ignoreWhitespace}
                                    onChange={(event) => setIgnoreWhitespace(event.target.checked)}
                                    className="h-4 w-4 rounded border-border"
                                />
                                Ignore whitespace
                            </label>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <ToolMetric label="Original" value={stats.original} />
                            <ToolMetric label="Unique" value={stats.unique} />
                            <ToolMetric label="Removed" value={stats.removed} />
                        </div>
                    </div>
                </ToolPanel>

                <div className="grid gap-4 md:grid-cols-2">
                    <ToolPanel
                        title="Input text"
                        actions={<button onClick={clearAll} className="btn btn-secondary h-8 gap-2 px-3"><Eraser className="h-4 w-4" />Clear</button>}
                    >
                        <ToolTextarea
                            className="min-h-[440px]"
                            placeholder="Paste your text here"
                            value={inputText}
                            onChange={(event) => setInputText(event.target.value)}
                        />
                    </ToolPanel>

                    <ToolPanel
                        title="Unique lines"
                        actions={<button onClick={() => navigator.clipboard.writeText(outputText)} disabled={!outputText} className="btn btn-secondary h-8 gap-2 px-3"><Clipboard className="h-4 w-4" />Copy</button>}
                    >
                        <ToolTextarea
                            readOnly
                            className="min-h-[440px]"
                            placeholder="Result will appear here"
                            value={outputText}
                        />
                    </ToolPanel>
                </div>
            </div>
        </ToolLayout>
    );
}
