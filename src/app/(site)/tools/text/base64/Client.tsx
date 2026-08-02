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

type Mode = 'encode' | 'decode';
type Base64Variant = 'standard' | 'url-safe';

const modeOptions: Array<{ label: string; value: Mode }> = [
    { label: 'Encode', value: 'encode' },
    { label: 'Decode', value: 'decode' },
];

const variantOptions: Array<{ label: string; value: Base64Variant }> = [
    { label: 'Standard', value: 'standard' },
    { label: 'URL-safe', value: 'url-safe' },
];

function bytesToBase64(bytes: Uint8Array) {
    let binary = '';
    const chunkSize = 0x8000;

    for (let index = 0; index < bytes.length; index += chunkSize) {
        const chunk = bytes.subarray(index, index + chunkSize);
        binary += String.fromCharCode(...Array.from(chunk));
    }

    return btoa(binary);
}

function normalizeBase64(value: string) {
    const stripped = value.trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    const firstPadding = stripped.indexOf('=');

    if (!stripped) return '';
    if (/[^A-Za-z0-9+/=]/.test(stripped)) {
        throw new Error('Invalid Base64 characters');
    }
    if (firstPadding !== -1 && /[^=]/.test(stripped.slice(firstPadding))) {
        throw new Error('Invalid Base64 padding');
    }

    const withoutPadding = stripped.replace(/=+$/, '');
    if (withoutPadding.length % 4 === 1) {
        throw new Error('Invalid Base64 length');
    }

    return `${withoutPadding}${'='.repeat((4 - (withoutPadding.length % 4)) % 4)}`;
}

function base64ToBytes(value: string) {
    const normalized = normalizeBase64(value);
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

function encodeText(value: string, variant: Base64Variant, includePadding: boolean) {
    const standard = bytesToBase64(new TextEncoder().encode(value));
    const output = variant === 'url-safe'
        ? standard.replace(/\+/g, '-').replace(/\//g, '_')
        : standard;

    return includePadding ? output : output.replace(/=+$/, '');
}

function decodeText(value: string) {
    const bytes = base64ToBytes(value);
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export default function Base64Encoder() {
    const [inputText, setInputText] = useToolState('base64', 'inputText', '');
    const [mode, setMode] = useToolState<Mode>('base64', 'mode', 'encode');
    const [variant, setVariant] = useToolState<Base64Variant>('base64', 'variant', 'standard');
    const [includePadding, setIncludePadding] = useToolState('base64', 'includePadding', true);
    const [copied, setCopied] = useState(false);
    const [clipboardError, setClipboardError] = useState('');

    const { outputText, error } = useMemo(() => {
        if (!inputText) {
            return { outputText: '', error: '' };
        }
        try {
            return {
                outputText: mode === 'encode'
                    ? encodeText(inputText, variant, includePadding)
                    : decodeText(inputText),
                error: '',
            };
        } catch {
            return {
                outputText: '',
                error: mode === 'encode'
                    ? 'Failed to encode this text.'
                    : 'Invalid Base64 or non-UTF-8 payload.',
            };
        }
    }, [includePadding, inputText, mode, variant]);

    const inputBytes = useMemo(() => new TextEncoder().encode(inputText).length, [inputText]);
    const outputBytes = useMemo(() => new TextEncoder().encode(outputText).length, [outputText]);

    useEffect(() => {
        setCopied(false);
        setClipboardError('');
    }, [outputText]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(outputText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            setClipboardError('Clipboard access was blocked by the browser.');
        }
    };

    const clearAll = () => {
        setInputText('');
        setCopied(false);
        setClipboardError('');
    };

    const swapValues = () => {
        setInputText(outputText);
        setMode(mode === 'encode' ? 'decode' : 'encode');
        setCopied(false);
        setClipboardError('');
    };

    return (
        <ToolLayout title="Base64 Encoder/Decoder" description="Encode text to Base64 or decode Base64 strings back to text" category="text">
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel
                    title="Conversion setup"
                    actions={<ToolSegmentedControl value={mode} options={modeOptions} onChange={setMode} />}
                >
                    <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                        <div className="rounded-md border bg-muted/20 p-4">
                            <div className="font-mono text-sm text-muted-foreground">FreeWebTools + UTF-8</div>
                            <div className="mt-2 break-words font-mono text-sm text-foreground">VXRpbHNIdWIgKyBVVEYtOA==</div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <p className="text-xs font-medium uppercase text-muted-foreground">Variant</p>
                                <ToolSegmentedControl value={variant} options={variantOptions} onChange={setVariant} />
                            </div>
                            <label className="flex min-h-20 items-start gap-3 rounded-md border bg-muted/20 p-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={includePadding}
                                    onChange={(event) => setIncludePadding(event.target.checked)}
                                    className="mt-1"
                                />
                                <span>
                                    <span className="block font-medium text-foreground">Padding</span>
                                    <span className="text-muted-foreground">Keep trailing =</span>
                                </span>
                            </label>
                        </div>
                    </div>
                </ToolPanel>

                <ToolPanel title={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}>
                    <ToolTextarea
                        value={inputText}
                        onChange={(event) => setInputText(event.target.value)}
                        placeholder={mode === 'encode' ? 'Enter text to encode...' : 'VXRpbHNIdWIgKyBVVEYtOA=='}
                        className="min-h-64"
                    />
                </ToolPanel>

                <ToolActionBar>
                    <button type="button" onClick={swapValues} disabled={!inputText && !outputText} className="btn btn-secondary gap-2">
                        <Repeat2 className="h-4 w-4" />
                        Swap
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                    <button type="button" onClick={copyToClipboard} disabled={!outputText} className="btn btn-primary gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy result'}
                    </button>
                </ToolActionBar>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}
                {clipboardError && <ToolStatus tone="error">{clipboardError}</ToolStatus>}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ToolMetric label="Input" value={inputText.length} description="characters" />
                    <ToolMetric label="Input bytes" value={inputBytes} description="UTF-8" />
                    <ToolMetric label="Output" value={outputText.length} description="characters" />
                    <ToolMetric label="Output bytes" value={outputBytes} description="UTF-8" />
                </div>

                <ToolPanel
                    title={mode === 'encode' ? 'Encoded Base64' : 'Decoded text'}
                    actions={outputText && (
                        <button type="button" onClick={copyToClipboard} className="btn btn-secondary gap-2">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    )}
                >
                    <ToolTextarea
                        value={outputText}
                        readOnly
                        placeholder="Result will appear here..."
                        className="min-h-64"
                    />
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
