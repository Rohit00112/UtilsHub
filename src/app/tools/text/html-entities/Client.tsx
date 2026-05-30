'use client';

import { useState } from 'react';
import { Check, Clipboard, Code2, Eraser, Repeat2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';

type Mode = 'encode' | 'decode';

const modeOptions: Array<{ label: string; value: Mode }> = [
    { label: 'Encode', value: 'encode' },
    { label: 'Decode', value: 'decode' },
];

const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

function encodeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => entityMap[character]);
}

function decodeHtml(value: string) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
}

export default function HtmlEntities() {
    const [mode, setMode] = useState<Mode>('encode');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const processText = () => {
        setError('');
        setCopied(false);

        try {
            setOutput(mode === 'encode' ? encodeHtml(input) : decodeHtml(input));
        } catch {
            setOutput('');
            setError('Unable to decode this input. Check that the entities are well formed.');
        }
    };

    const copyOutput = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setError('Clipboard access was blocked by the browser.');
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setError('');
        setCopied(false);
    };

    const swapValues = () => {
        setInput(output);
        setOutput(input);
        setMode(mode === 'encode' ? 'decode' : 'encode');
        setError('');
        setCopied(false);
    };

    return (
        <ToolLayout title="HTML Entity Encoder" description="Encode reserved HTML characters or decode entities back to text" category="text">
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel
                    title="Conversion mode"
                    description="Encode text before displaying it as markup, or decode entities copied from HTML."
                    actions={<ToolSegmentedControl value={mode} options={modeOptions} onChange={setMode} />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-md border bg-muted/20 p-4">
                            <div className="font-mono text-sm text-muted-foreground">&lt;span&gt;5 &gt; 3&lt;/span&gt;</div>
                            <div className="mt-2 font-mono text-sm text-foreground">&amp;lt;span&amp;gt;5 &amp;gt; 3&amp;lt;/span&amp;gt;</div>
                        </div>
                        <div className="rounded-md border bg-muted/20 p-4">
                            <div className="font-mono text-sm text-muted-foreground">&amp;quot;Hello&amp;quot;</div>
                            <div className="mt-2 font-mono text-sm text-foreground">&quot;Hello&quot;</div>
                        </div>
                    </div>
                </ToolPanel>

                <ToolPanel title={mode === 'encode' ? 'Text to encode' : 'Entities to decode'}>
                    <ToolTextarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder={mode === 'encode' ? '<strong>Encode this snippet</strong>' : '&lt;strong&gt;Decode this snippet&lt;/strong&gt;'}
                        className="min-h-64"
                    />
                </ToolPanel>

                <ToolActionBar>
                    <button type="button" onClick={processText} className="btn btn-primary gap-2">
                        <Code2 className="h-4 w-4" />
                        {mode === 'encode' ? 'Encode HTML' : 'Decode entities'}
                    </button>
                    <button type="button" onClick={swapValues} disabled={!input && !output} className="btn btn-secondary gap-2">
                        <Repeat2 className="h-4 w-4" />
                        Swap
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                <ToolPanel
                    title={mode === 'encode' ? 'Encoded output' : 'Decoded output'}
                    actions={output && (
                        <button type="button" onClick={copyOutput} className="btn btn-secondary gap-2">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    )}
                >
                    <ToolTextarea
                        value={output}
                        readOnly
                        placeholder="Result will appear here..."
                        className="min-h-64"
                    />
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
