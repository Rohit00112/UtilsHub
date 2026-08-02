'use client';

import { useState } from 'react';
import { Clipboard, Eraser, Lock, Unlock } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const textareaClass = 'min-h-56 w-full rounded-md border border-input bg-background px-4 py-3 font-mono text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring';

export default function URLEncoder() {
    const [inputText, setInputText] = useToolState('url-encoder', 'inputText', '');
    const [outputText, setOutputText] = useToolState('url-encoder', 'outputText', '');
    const [mode, setMode] = useToolState<'encode' | 'decode'>('url-encoder', 'mode', 'encode');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleProcess = () => {
        try {
            setError('');
            setCopied(false);
            setOutputText(mode === 'encode' ? encodeURIComponent(inputText) : decodeURIComponent(inputText));
        } catch {
            setOutputText('');
            setError('Failed to decode. Check for malformed percent encoding.');
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
        <ToolLayout title="URL Encoder/Decoder" description="Encode URLs for safe transmission or decode URL-encoded strings" category="text">
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

                <ToolPanel title={mode === 'encode' ? 'URL to encode' : 'URL to decode'}>
                    <textarea
                        id="input"
                        className={textareaClass}
                        value={inputText}
                        onChange={(event) => setInputText(event.target.value)}
                        placeholder={mode === 'encode' ? 'Enter URL to encode...' : 'Enter encoded URL to decode...'}
                    />
                </ToolPanel>

                <ToolActionBar>
                    <button onClick={handleProcess} className="btn btn-primary gap-2">
                        {mode === 'encode' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
                    </button>
                    <button onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                <ToolPanel
                    title={mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}
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
