'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, Repeat2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type Mode = 'encode' | 'decode';
type OutputFormat = 'binary' | 'decimal' | 'octal' | 'hex';
type Separator = 'space' | 'comma' | 'none';

const modeOptions: Array<{ label: string; value: Mode }> = [
    { label: 'Encode', value: 'encode' },
    { label: 'Decode', value: 'decode' },
];

const formatOptions: Array<{ label: string; value: OutputFormat }> = [
    { label: 'Binary', value: 'binary' },
    { label: 'ASCII', value: 'decimal' },
    { label: 'Octal', value: 'octal' },
    { label: 'Hex', value: 'hex' },
];

const separatorOptions: Array<{ label: string; value: Separator }> = [
    { label: 'Space', value: 'space' },
    { label: 'Comma', value: 'comma' },
    { label: 'None', value: 'none' },
];

/* ------------------------------------------------------------------ */
/*  Conversion helpers                                                  */
/* ------------------------------------------------------------------ */

function getSeparator(sep: Separator): string {
    if (sep === 'comma') return ', ';
    if (sep === 'none') return '';
    return ' ';
}

function encodeText(text: string, format: OutputFormat, separator: Separator): string {
    const bytes = new TextEncoder().encode(text);
    const sep = getSeparator(separator);
    const parts: string[] = [];

    for (const byte of bytes) {
        switch (format) {
            case 'binary':
                parts.push(byte.toString(2).padStart(8, '0'));
                break;
            case 'decimal':
                parts.push(byte.toString(10));
                break;
            case 'octal':
                parts.push(byte.toString(8).padStart(3, '0'));
                break;
            case 'hex':
                parts.push(byte.toString(16).padStart(2, '0').toUpperCase());
                break;
        }
    }

    return parts.join(sep);
}

function decodeText(input: string, format: OutputFormat): string {
    // Split on whitespace, commas, or treat as fixed-width chunks
    const cleaned = input.trim();
    if (!cleaned) return '';

    let parts: string[];
    if (/[,\s]/.test(cleaned)) {
        parts = cleaned.split(/[,\s]+/).filter(Boolean);
    } else {
        // No separator — split by fixed width
        const width = format === 'binary' ? 8 : format === 'octal' ? 3 : 2;
        parts = [];
        for (let i = 0; i < cleaned.length; i += width) {
            parts.push(cleaned.slice(i, i + width));
        }
    }

    const radix = format === 'binary' ? 2 : format === 'decimal' ? 10 : format === 'octal' ? 8 : 16;
    const bytes = new Uint8Array(parts.map((p) => {
        const n = parseInt(p, radix);
        if (isNaN(n) || n < 0 || n > 255) throw new Error(`Invalid value: ${p}`);
        return n;
    }));

    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function TextToBinary() {
    const [input, setInput] = useToolState('text-to-binary', 'input', '');
    const [mode, setMode] = useToolState<Mode>('text-to-binary', 'mode', 'encode');
    const [format, setFormat] = useToolState<OutputFormat>('text-to-binary', 'format', 'binary');
    const [separator, setSeparator] = useToolState<Separator>('text-to-binary', 'separator', 'space');
    const [copied, setCopied] = useState(false);
    const [clipError, setClipError] = useState('');

    const { output, error } = useMemo(() => {
        if (!input) return { output: '', error: '' };
        try {
            return {
                output: mode === 'encode'
                    ? encodeText(input, format, separator)
                    : decodeText(input, format),
                error: '',
            };
        } catch {
            return {
                output: '',
                error: mode === 'encode'
                    ? 'Failed to encode this text.'
                    : `Invalid ${format} input. Check the values and format.`,
            };
        }
    }, [input, mode, format, separator]);

    const inputLen = input.length;
    const outputLen = output.length;

    useEffect(() => { setCopied(false); setClipError(''); }, [output]);

    const copyResult = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            setClipError('Clipboard access was blocked.');
        }
    };

    const clearAll = () => {
        setInput('');
        setCopied(false);
        setClipError('');
    };

    const swap = () => {
        setInput(output);
        setMode(mode === 'encode' ? 'decode' : 'encode');
        setCopied(false);
        setClipError('');
    };

    return (
        <ToolLayout title="Text to Binary Converter" description="Convert text to binary, ASCII decimal, octal, or hexadecimal and back" category="text">
            <div className="mx-auto max-w-5xl space-y-6">

                {/* ── Controls ───────────────────────────────────── */}
                <ToolPanel title="Conversion settings">
                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                        <div className="space-y-2">
                            <p className="text-xs font-medium uppercase text-muted-foreground">Direction</p>
                            <ToolSegmentedControl value={mode} options={modeOptions} onChange={setMode} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-medium uppercase text-muted-foreground">Format</p>
                            <ToolSegmentedControl value={format} options={formatOptions} onChange={setFormat} />
                        </div>
                        {mode === 'encode' && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium uppercase text-muted-foreground">Separator</p>
                                <ToolSegmentedControl value={separator} options={separatorOptions} onChange={setSeparator} />
                            </div>
                        )}
                    </div>
                </ToolPanel>

                {/* ── Input ──────────────────────────────────────── */}
                <ToolPanel
                    title={mode === 'encode' ? 'Text input' : `${format.charAt(0).toUpperCase() + format.slice(1)} input`}
                    actions={
                        <button onClick={clearAll} className="btn btn-secondary h-8 gap-2 px-3">
                            <Eraser className="h-4 w-4" />Clear
                        </button>
                    }
                >
                    <ToolTextarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === 'encode' ? 'Type or paste text here...' : 'Paste binary / decimal / octal / hex values...'}
                        className="min-h-40"
                    />
                </ToolPanel>

                {/* ── Actions ────────────────────────────────────── */}
                <ToolActionBar>
                    <button type="button" onClick={swap} disabled={!output} className="btn btn-secondary gap-2">
                        <Repeat2 className="h-4 w-4" />Swap
                    </button>
                    <button type="button" onClick={copyResult} disabled={!output} className="btn btn-primary gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy result'}
                    </button>
                </ToolActionBar>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}
                {clipError && <ToolStatus tone="error">{clipError}</ToolStatus>}

                {/* ── Metrics ────────────────────────────────────── */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ToolMetric label="Input" value={inputLen} description="characters" />
                    <ToolMetric label="Output" value={outputLen} description="characters" />
                    <ToolMetric label="Format" value={format.charAt(0).toUpperCase() + format.slice(1)} description={mode === 'encode' ? 'encoding' : 'decoding'} />
                    <ToolMetric label="Mode" value={mode === 'encode' ? 'Text → Code' : 'Code → Text'} description="direction" />
                </div>

                {/* ── Output ─────────────────────────────────────── */}
                <ToolPanel
                    title={mode === 'encode' ? `${format.charAt(0).toUpperCase() + format.slice(1)} output` : 'Decoded text'}
                    actions={output && (
                        <button type="button" onClick={copyResult} className="btn btn-secondary h-8 gap-2 px-3">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    )}
                >
                    <ToolTextarea
                        value={output}
                        readOnly
                        placeholder="Result will appear here..."
                        className="min-h-40"
                    />
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
