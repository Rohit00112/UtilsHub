'use client';

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';

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
        const uniqueLines = new Set();
        const result: string[] = [];

        lines.forEach(line => {
            let comparisonLine = line;

            if (ignoreWhitespace) {
                comparisonLine = comparisonLine.trim();
            }
            if (!caseSensitive) {
                comparisonLine = comparisonLine.toLowerCase();
            }

            if (!uniqueLines.has(comparisonLine)) {
                uniqueLines.add(comparisonLine);
                // We push the original line (or trimmed if ignoreWhitespace is on, depending on preference, 
                // but usually we want to keep the original formatting of the first occurrence)
                // If ignoreWhitespace is true, we might want to trim the output too, or just keep the first one found.
                // Let's keep the first one found as is, unless ignoreWhitespace is strictly about matching.
                // Actually, if ignoreWhitespace is true, users often expect the output to be cleaned up too.
                // But let's stick to "remove duplicates" logic: keep the first instance that matches the criteria.
                result.push(ignoreWhitespace ? line.trim() : line);
            }
        });

        setOutputText(result.join('\n'));
        setStats({
            original: lines.length,
            unique: result.length,
            removed: lines.length - result.length
        });
    }, [inputText, caseSensitive, ignoreWhitespace, setOutputText, setStats]);

    useEffect(() => {
        processText();
    }, [processText]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputText);
    };

    const clearAll = () => {
        setInputText('');
    };

    return (
        <ToolLayout
            title="Remove Duplicate Lines"
            description="Clean up your text lists by removing repeated lines instantly"
            category="special"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Options Bar */}
                <div className="bg-card border-2 border-border rounded-lg p-4 flex flex-wrap gap-6 items-center justify-between">
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={caseSensitive}
                                onChange={(e) => setCaseSensitive(e.target.checked)}
                                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 bg-muted/30"
                            />
                            <span className="text-foreground">Case Sensitive</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={ignoreWhitespace}
                                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 bg-muted/30"
                            />
                            <span className="text-foreground">Ignore Whitespace</span>
                        </label>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground font-mono">
                        <span>Original: <strong className="text-foreground">{stats.original}</strong></span>
                        <span>Unique: <strong className="text-primary">{stats.unique}</strong></span>
                        <span>Removed: <strong className="text-red-400">{stats.removed}</strong></span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
                    {/* Input Section */}
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-lg font-semibold text-foreground">Input Text</label>
                            <button
                                onClick={clearAll}
                                className="text-sm text-muted-foreground hover:text-red-400 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                        <textarea
                            className="flex-1 w-full p-4 bg-card border-2 border-border rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-mono text-sm leading-relaxed"
                            placeholder="Paste your text here..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </div>

                    {/* Output Section */}
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-lg font-semibold text-foreground">Unique Lines</label>
                            <button
                                onClick={copyToClipboard}
                                disabled={!outputText}
                                className="btn btn-primary py-1 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Copy Result
                            </button>
                        </div>
                        <textarea
                            readOnly
                            className="flex-1 w-full p-4 bg-muted/30 border-2 border-border rounded-lg resize-none focus:outline-none font-mono text-sm leading-relaxed text-foreground"
                            placeholder="Result will appear here..."
                            value={outputText}
                        />
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
