'use client';

import { useState } from 'react';
import { Clipboard, Eraser, ListX } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const textareaClass = 'h-96 w-full rounded-md border border-input bg-background px-4 py-3 font-mono text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring';

export default function RemoveDuplicateLines() {
    const [input, setInput] = useToolState('remove-duplicates-lines', 'input', '');
    const [output, setOutput] = useToolState('remove-duplicates-lines', 'output', '');
    const [copied, setCopied] = useState(false);
    const [options, setOptions] = useToolState('remove-duplicates-lines', 'options', {
        caseSensitive: false,
        ignoreWhitespace: false,
    });

    const processText = () => {
        if (!input.trim()) return;

        const lines = input.split('\n');
        const uniqueLines = new Set<string>();
        const result: string[] = [];

        lines.forEach((line) => {
            let key = line;
            if (!options.caseSensitive) key = key.toLowerCase();
            if (options.ignoreWhitespace) key = key.trim();

            if (!uniqueLines.has(key)) {
                uniqueLines.add(key);
                result.push(line);
            }
        });

        setOutput(result.join('\n'));
        setCopied(false);
    };

    const clearText = () => {
        setInput('');
        setOutput('');
        setCopied(false);
    };

    const copyResult = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <ToolLayout
            title="Remove Duplicate Lines"
            description="Remove duplicate lines from your text with options for case sensitivity and whitespace"
            category="text"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Options">
                    <div className="flex flex-wrap gap-4">
                        <label className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={options.caseSensitive}
                                onChange={(event) => setOptions({ ...options, caseSensitive: event.target.checked })}
                                className="h-4 w-4 accent-current"
                            />
                            Case sensitive
                        </label>
                        <label className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={options.ignoreWhitespace}
                                onChange={(event) => setOptions({ ...options, ignoreWhitespace: event.target.checked })}
                                className="h-4 w-4 accent-current"
                            />
                            Ignore whitespace
                        </label>
                    </div>
                </ToolPanel>

                <div className="grid gap-6 md:grid-cols-2">
                    <ToolPanel title="Input text">
                        <textarea
                            id="input"
                            className={textareaClass}
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Paste your text here..."
                        />
                    </ToolPanel>

                    <ToolPanel
                        title="Unique lines"
                        actions={output && (
                            <button onClick={copyResult} className="btn btn-secondary gap-2">
                                <Clipboard className="h-4 w-4" />
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        )}
                    >
                        <textarea
                            id="output"
                            readOnly
                            className={textareaClass}
                            value={output}
                            placeholder="Result will appear here..."
                        />
                        {copied && <ToolStatus tone="success" className="mt-3">Result copied to clipboard.</ToolStatus>}
                    </ToolPanel>
                </div>

                <ToolActionBar className="justify-center">
                    <button onClick={processText} className="btn btn-primary gap-2">
                        <ListX className="h-4 w-4" />
                        Remove duplicates
                    </button>
                    <button onClick={clearText} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>
            </div>
        </ToolLayout>
    );
}
