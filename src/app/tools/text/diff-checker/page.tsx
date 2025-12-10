'use client';

import { useState } from 'react';
import * as Diff from 'diff';
import ToolLayout from '@/components/ToolLayout';

export default function DiffChecker() {
    const [original, setOriginal] = useState('');
    const [changed, setChanged] = useState('');
    const [diffResult, setDiffResult] = useState<Diff.Change[] | null>(null);

    const compareText = () => {
        const diff = Diff.diffLines(original, changed);
        setDiffResult(diff);
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
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Original Input */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label htmlFor="original" className="text-lg font-semibold text-text-primary">
                                Original Text
                            </label>
                        </div>
                        <textarea
                            id="original"
                            className="w-full h-[300px] px-4 py-3 bg-bg-secondary border-2 border-border rounded-lg text-text-primary text-base font-mono resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary"
                            value={original}
                            onChange={(e) => setOriginal(e.target.value)}
                            placeholder="Paste original text here..."
                        />
                    </div>

                    {/* Changed Input */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label htmlFor="changed" className="text-lg font-semibold text-text-primary">
                                Changed Text
                            </label>
                            <button onClick={clearText} className="text-sm text-text-secondary hover:text-red-500 transition-colors">
                                Clear All
                            </button>
                        </div>
                        <textarea
                            id="changed"
                            className="w-full h-[300px] px-4 py-3 bg-bg-secondary border-2 border-border rounded-lg text-text-primary text-base font-mono resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary"
                            value={changed}
                            onChange={(e) => setChanged(e.target.value)}
                            placeholder="Paste changed text here..."
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={compareText}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-10 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg"
                    >
                        Compare Texts
                    </button>
                </div>

                {/* Diff Result */}
                {diffResult && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-text-primary">Comparison Result</h2>
                        <div className="bg-bg-tertiary border-2 border-border rounded-lg p-6 font-mono text-base overflow-x-auto whitespace-pre-wrap">
                            {diffResult.map((part, index) => {
                                let className = 'text-text-primary';
                                if (part.added) {
                                    className = 'bg-green-500/20 text-green-700 dark:text-green-400 block';
                                } else if (part.removed) {
                                    className = 'bg-red-500/20 text-red-700 dark:text-red-400 block decoration-wavy line-through decoration-red-500/50';
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
            </div>
        </ToolLayout>
    );
}
