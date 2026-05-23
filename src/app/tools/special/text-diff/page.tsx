'use client';

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import * as Diff from 'diff';

export default function TextDiffChecker() {
    const [originalText, setOriginalText] = useState('');
    const [modifiedText, setModifiedText] = useState('');
    const [diffResult, setDiffResult] = useState<Diff.Change[]>([]);
    const [diffMode, setDiffMode] = useState<'chars' | 'words' | 'lines'>('words');

    const calculateDiff = useCallback(() => {
        if (!originalText && !modifiedText) {
            setDiffResult([]);
            return;
        }

        let diff;
        switch (diffMode) {
            case 'chars':
                diff = Diff.diffChars(originalText, modifiedText);
                break;
            case 'words':
                diff = Diff.diffWords(originalText, modifiedText);
                break;
            case 'lines':
                diff = Diff.diffLines(originalText, modifiedText);
                break;
            default:
                diff = Diff.diffWords(originalText, modifiedText);
        }
        setDiffResult(diff);
    }, [originalText, modifiedText, diffMode]);

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
            description="Compare two texts and highlight the differences instantly"
            category="special"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Controls */}
                <div className="bg-card border-2 border-border rounded-lg p-4 flex flex-wrap gap-6 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground font-medium">Compare by:</span>
                        <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
                            {(['chars', 'words', 'lines'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setDiffMode(mode)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${diffMode === mode
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={clearAll}
                        className="text-sm text-muted-foreground hover:text-red-400 transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                {/* Input Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                    <div className="flex flex-col h-full">
                        <label className="text-lg font-semibold text-foreground mb-3">Original Text</label>
                        <textarea
                            className="flex-1 w-full p-4 bg-card border-2 border-border rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-mono text-sm leading-relaxed"
                            placeholder="Paste original text here..."
                            value={originalText}
                            onChange={(e) => setOriginalText(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col h-full">
                        <label className="text-lg font-semibold text-foreground mb-3">Modified Text</label>
                        <textarea
                            className="flex-1 w-full p-4 bg-card border-2 border-border rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-mono text-sm leading-relaxed"
                            placeholder="Paste modified text here..."
                            value={modifiedText}
                            onChange={(e) => setModifiedText(e.target.value)}
                        />
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-card border-2 border-border rounded-lg p-6 min-h-[200px]">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Differences</h3>
                    <div className="bg-muted/30 p-6 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap break-words border border-border">
                        {diffResult.length > 0 ? (
                            diffResult.map((part, index) => {
                                const color = part.added ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                                    part.removed ? 'bg-red-500/20 text-red-700 dark:text-red-400 decoration-wavy line-through decoration-red-400/50' :
                                        'text-foreground';
                                return (
                                    <span key={index} className={`${color} px-0.5 rounded`}>
                                        {part.value}
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-muted-foreground italic">Result will appear here...</span>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
