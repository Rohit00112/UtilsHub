'use client';

import { useState } from 'react';
import { Clipboard, Eraser } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const textareaClass = 'min-h-56 w-full rounded-md border border-input bg-background px-4 py-3 font-mono text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring';

export default function CaseConverter() {
    const [inputText, setInputText] = useToolState('case-converter', 'inputText', '');
    const [outputText, setOutputText] = useToolState('case-converter', 'outputText', '');
    const [copied, setCopied] = useState(false);

    const conversions = [
        { label: 'UPPER CASE', convert: () => inputText.toUpperCase() },
        { label: 'lower case', convert: () => inputText.toLowerCase() },
        { label: 'Title Case', convert: () => inputText.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') },
        { label: 'Sentence case', convert: () => inputText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase()) },
        { label: 'camelCase', convert: () => inputText.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()) },
        { label: 'snake_case', convert: () => inputText.trim().replace(/\s+/g, '_').replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, '') },
        { label: 'kebab-case', convert: () => inputText.trim().replace(/\s+/g, '-').replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/^-/, '').toLowerCase() },
    ];

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setInputText('');
        setOutputText('');
        setCopied(false);
    };

    return (
        <ToolLayout
            title="Text Case Converter"
            description="Convert text between upper, lower, title, sentence, camel, snake, and kebab case"
            category="text"
        >
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel title="Input text" description="Paste text, then choose a conversion.">
                    <textarea
                        id="input"
                        className={textareaClass}
                        value={inputText}
                        onChange={(event) => setInputText(event.target.value)}
                        placeholder="Enter your text here..."
                    />
                    <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                        <span>Characters: {inputText.length}</span>
                        <span>Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</span>
                    </div>
                </ToolPanel>

                <ToolPanel title="Conversions">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {conversions.map((conversion) => (
                            <button key={conversion.label} onClick={() => setOutputText(conversion.convert())} className="btn btn-primary">
                                {conversion.label}
                            </button>
                        ))}
                        <button onClick={clearAll} className="btn btn-secondary gap-2">
                            <Eraser className="h-4 w-4" />
                            Clear
                        </button>
                    </div>
                </ToolPanel>

                <ToolPanel
                    title="Output text"
                    actions={outputText && (
                        <button onClick={copyToClipboard} className="btn btn-secondary gap-2">
                            <Clipboard className="h-4 w-4" />
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    )}
                >
                    <textarea
                        id="output"
                        className={textareaClass}
                        value={outputText}
                        readOnly
                        placeholder="Converted text will appear here..."
                    />
                    {copied && <ToolStatus tone="success" className="mt-3">Output copied to clipboard.</ToolStatus>}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
