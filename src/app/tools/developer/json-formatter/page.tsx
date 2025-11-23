'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function JsonFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const formatJson = () => {
        try {
            setError('');
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
        } catch (err) {
            setError('Invalid JSON');
        }
    };

    const minifyJson = () => {
        try {
            setError('');
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
        } catch (err) {
            setError('Invalid JSON');
        }
    };

    const copyToClipboard = () => navigator.clipboard.writeText(output);
    const clearAll = () => { setInput(''); setOutput(''); setError(''); };

    return (
        <ToolLayout title="JSON Formatter & Validator" description="Format, minify, and validate JSON data" category="developer">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input */}
                    <div className="flex flex-col h-[600px]">
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold text-text-primary">Input JSON</label>
                            <button onClick={clearAll} className="text-sm text-error hover:underline">Clear</button>
                        </div>
                        <textarea
                            className="flex-1 w-full p-4 bg-bg-tertiary border-2 border-border rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-primary"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your JSON here..."
                        />
                    </div>

                    {/* Output */}
                    <div className="flex flex-col h-[600px]">
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold text-text-primary">Output</label>
                            {output && <button onClick={copyToClipboard} className="text-sm text-primary hover:underline">Copy Output</button>}
                        </div>
                        <textarea
                            className={`flex-1 w-full p-4 bg-bg-tertiary border-2 rounded-lg font-mono text-sm resize-none focus:outline-none ${error ? 'border-error' : 'border-border'}`}
                            value={error || output}
                            readOnly
                            placeholder="Formatted JSON will appear here..."
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={formatJson} className="btn btn-primary">Beautify</button>
                    <button onClick={minifyJson} className="btn btn-secondary">Minify</button>
                </div>
            </div>
        </ToolLayout>
    );
}
