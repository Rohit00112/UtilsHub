'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import format from 'xml-formatter';

export default function XmlFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState({
        indentation: '  ',
        collapseContent: false,
        lineSeparator: '\n'
    });

    const handleFormat = () => {
        try {
            setError(null);
            if (!input.trim()) {
                setOutput('');
                return;
            }
            const formatted = format(input, {
                indentation: options.indentation,
                collapseContent: options.collapseContent,
                lineSeparator: options.lineSeparator
            });
            setOutput(formatted);
        } catch (err) {
            setError('Invalid XML: ' + (err as Error).message);
        }
    };

    const handleMinify = () => {
        try {
            setError(null);
            if (!input.trim()) {
                setOutput('');
                return;
            }
            const formatted = format(input, {
                indentation: '',
                lineSeparator: '',
                collapseContent: true
            });
            setOutput(formatted);
        } catch (err) {
            setError('Invalid XML: ' + (err as Error).message);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <ToolLayout title="XML Formatter" description="Format, validate, and minify XML data" category="developer">
            <div className="max-w-6xl mx-auto space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-text-secondary font-medium">Input XML</label>
                            <button
                                onClick={() => setInput('')}
                                className="text-xs px-2 py-1 bg-bg-tertiary rounded hover:bg-bg-primary transition-colors text-text-secondary"
                            >
                                Clear
                            </button>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-[500px] p-4 bg-bg-secondary border-2 border-border rounded-lg font-mono text-sm resize-none focus:border-primary focus:outline-none transition-colors"
                            placeholder="Paste your XML here..."
                        />
                    </div>

                    {/* Output Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-text-secondary font-medium">Formatted XML</label>
                            <button
                                onClick={copyToClipboard}
                                className="text-xs px-2 py-1 bg-bg-tertiary rounded hover:bg-bg-primary transition-colors text-text-secondary"
                            >
                                Copy
                            </button>
                        </div>
                        <textarea
                            value={output}
                            readOnly
                            className="w-full h-[500px] p-4 bg-bg-tertiary border-2 border-border rounded-lg font-mono text-sm resize-none focus:outline-none"
                            placeholder="Formatted output will appear here..."
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-bg-secondary border border-border rounded-lg p-6">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-text-secondary">Indentation:</label>
                            <select
                                value={options.indentation}
                                onChange={(e) => setOptions({ ...options, indentation: e.target.value })}
                                className="input py-1 px-3 text-sm"
                            >
                                <option value="  ">2 Spaces</option>
                                <option value="    ">4 Spaces</option>
                                <option value="	">Tab</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="collapse"
                                checked={options.collapseContent}
                                onChange={(e) => setOptions({ ...options, collapseContent: e.target.checked })}
                                className="rounded border-border bg-bg-tertiary text-primary focus:ring-primary"
                            />
                            <label htmlFor="collapse" className="text-sm text-text-secondary">Collapse Content</label>
                        </div>

                        <div className="flex-1"></div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleMinify}
                                className="btn btn-secondary"
                            >
                                Minify
                            </button>
                            <button
                                onClick={handleFormat}
                                className="btn btn-primary px-8"
                            >
                                Format XML
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
