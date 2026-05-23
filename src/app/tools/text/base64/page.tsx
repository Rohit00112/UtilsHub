'use client';

import { useState } from 'react';
import { Clipboard, Eraser, Lock, Unlock } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';

const textareaClass = 'min-h-56 w-full rounded-md border border-input bg-background px-4 py-3 font-mono text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring';

export default function Base64Encoder() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleProcess = () => {
        try {
            setError('');
            setCopied(false);
            setOutputText(mode === 'encode' ? btoa(inputText) : atob(inputText));
        } catch {
            setOutputText('');
            setError(mode === 'encode' ? 'Failed to encode. Please check your input.' : 'Failed to decode. Invalid Base64 string.');
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setInputText('');
        setOutputText('');
        setError('');
        setCopied(false);
    };

    return (
        <ToolLayout title="Base64 Encoder/Decoder" description="Encode text to Base64 or decode Base64 strings back to text" category="text">
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolActionBar>
                    <button className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'} gap-2`} onClick={() => setMode('encode')}>
                        <Lock className="h-4 w-4" />
                        Encode
                    </button>
                    <button className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'} gap-2`} onClick={() => setMode('decode')}>
                        <Unlock className="h-4 w-4" />
                        Decode
                    </button>
                </ToolActionBar>

                <ToolPanel title={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}>
                    <textarea
                        id="input"
                        className={textareaClass}
                        value={inputText}
                        onChange={(event) => setInputText(event.target.value)}
                        placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                    />
                </ToolPanel>

                <ToolActionBar>
                    <button onClick={handleProcess} className="btn btn-primary gap-2">
                        {mode === 'encode' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
                    </button>
                    <button onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                <ToolPanel
                    title={mode === 'encode' ? 'Encoded Base64' : 'Decoded text'}
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
                        placeholder="Result will appear here..."
                    />
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
