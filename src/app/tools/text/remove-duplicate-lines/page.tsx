'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function RemoveDuplicateLines() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [options, setOptions] = useState({
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
            if (!options.caseSensitive) {
                key = key.toLowerCase();
            }
            if (options.ignoreWhitespace) {
                key = key.trim();
            }

            if (!uniqueLines.has(key)) {
                uniqueLines.add(key);
                result.push(line);
            }
        });

        setOutput(result.join('\n'));
    };

    const clearText = () => {
        setInput('');
        setOutput('');
    };

    return (
        <ToolLayout
            title="Remove Duplicate Lines"
            description="Remove duplicate lines from your text with options for case sensitivity and whitespace"
            category="text"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Options */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6 flex flex-wrap gap-6 items-center">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={options.caseSensitive}
                            onChange={(e) => setOptions({ ...options, caseSensitive: e.target.checked })}
                            className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-primary/20 bg-bg-tertiary transition-colors"
                        />
                        <span className="text-text-primary group-hover:text-primary transition-colors font-medium">Case Sensitive</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={options.ignoreWhitespace}
                            onChange={(e) => setOptions({ ...options, ignoreWhitespace: e.target.checked })}
                            className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-primary/20 bg-bg-tertiary transition-colors"
                        />
                        <span className="text-text-primary group-hover:text-primary transition-colors font-medium">Ignore Whitespace</span>
                    </label>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Input */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label htmlFor="input" className="text-lg font-semibold text-text-primary">
                                Input Text
                            </label>
                            <button onClick={clearText} className="text-sm text-text-secondary hover:text-red-500 transition-colors">
                                Clear
                            </button>
                        </div>
                        <textarea
                            id="input"
                            className="w-full h-[500px] px-4 py-3 bg-bg-secondary border-2 border-border rounded-lg text-text-primary text-base font-mono resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your text here..."
                        />
                    </div>

                    {/* Output */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label htmlFor="output" className="text-lg font-semibold text-text-primary">
                                Unique Lines
                            </label>
                            <button
                                onClick={() => navigator.clipboard.writeText(output)}
                                className="text-sm text-primary hover:text-primary-dark transition-colors"
                                disabled={!output}
                            >
                                Copy Result
                            </button>
                        </div>
                        <textarea
                            id="output"
                            readOnly
                            className="w-full h-[500px] px-4 py-3 bg-bg-tertiary border-2 border-border rounded-lg text-text-primary text-base font-mono resize-none focus:outline-none"
                            value={output}
                            placeholder="Result will appear here..."
                        />
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <button
                        onClick={processText}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg"
                    >
                        Remove Duplicates
                    </button>
                </div>
            </div>
        </ToolLayout>
    );
}
