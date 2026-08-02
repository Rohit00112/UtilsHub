'use client';

import { useState } from 'react';
import { Check, Clipboard, Eraser, KeyRound, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type Algorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
type OutputFormat = 'hex' | 'base64';

const algorithmOptions: Array<{ label: string; value: Algorithm }> = [
    { label: 'SHA-256', value: 'SHA-256' },
    { label: 'SHA-384', value: 'SHA-384' },
    { label: 'SHA-512', value: 'SHA-512' },
];

const formatOptions: Array<{ label: string; value: OutputFormat }> = [
    { label: 'Hex', value: 'hex' },
    { label: 'Base64', value: 'base64' },
];

function bytesToHex(bytes: ArrayBuffer) {
    return Array.from(new Uint8Array(bytes))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

function bytesToBase64(bytes: ArrayBuffer) {
    const binary = Array.from(new Uint8Array(bytes))
        .map((byte) => String.fromCharCode(byte))
        .join('');
    return btoa(binary);
}

async function generateHmac({
    message,
    secret,
    algorithm,
    format,
}: {
    message: string;
    secret: string;
    algorithm: Algorithm;
    format: OutputFormat;
}) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: algorithm },
        false,
        ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return format === 'hex' ? bytesToHex(signature) : bytesToBase64(signature);
}

const sampleMessage = '{"event":"invoice.paid","id":"evt_123"}';
const sampleSecret = 'whsec_test_secret';

export default function HmacGenerator() {
    const [message, setMessage] = useToolState('hmac-generator', 'message', sampleMessage);
    const [secret, setSecret] = useToolState('hmac-generator', 'secret', sampleSecret);
    const [algorithm, setAlgorithm] = useToolState<Algorithm>('hmac-generator', 'algorithm', 'SHA-256');
    const [format, setFormat] = useToolState<OutputFormat>('hmac-generator', 'format', 'hex');
    const [signature, setSignature] = useToolState('hmac-generator', 'signature', '');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const signMessage = async () => {
        setError('');
        setCopied(false);

        if (!secret) {
            setSignature('');
            setError('Enter a secret key before generating an HMAC signature.');
            return;
        }

        try {
            setSignature(await generateHmac({ message, secret, algorithm, format }));
        } catch {
            setSignature('');
            setError('Unable to generate HMAC in this browser context.');
        }
    };

    const copySignature = async () => {
        await navigator.clipboard.writeText(signature);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setMessage('');
        setSecret('');
        setSignature('');
        setError('');
        setCopied(false);
    };

    const loadSample = () => {
        setMessage(sampleMessage);
        setSecret(sampleSecret);
        setAlgorithm('SHA-256');
        setFormat('hex');
        setSignature('');
        setError('');
        setCopied(false);
    };

    return (
        <ToolLayout title="HMAC Generator" description="Generate keyed SHA signatures for payloads and webhook tests" category="security">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Signing options">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                        <ToolField label="Secret key" htmlFor="secret-key">
                            <input
                                id="secret-key"
                                type="password"
                                value={secret}
                                onChange={(event) => setSecret(event.target.value)}
                                placeholder="Shared secret"
                                className="input h-10 font-mono"
                            />
                        </ToolField>
                        <ToolField label="Algorithm">
                            <ToolSegmentedControl value={algorithm} options={algorithmOptions} onChange={setAlgorithm} />
                        </ToolField>
                        <ToolField label="Output">
                            <ToolSegmentedControl value={format} options={formatOptions} onChange={setFormat} />
                        </ToolField>
                    </div>
                </ToolPanel>

                <ToolPanel title="Message payload">
                    <ToolTextarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Paste the exact message to sign..."
                        className="min-h-64"
                    />
                </ToolPanel>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                <ToolActionBar>
                    <button type="button" onClick={signMessage} className="btn btn-primary gap-2">
                        <KeyRound className="h-4 w-4" />
                        Generate HMAC
                    </button>
                    <button type="button" onClick={copySignature} disabled={!signature} className="btn btn-secondary gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button type="button" onClick={loadSample} className="btn btn-secondary gap-2">
                        <Wand2 className="h-4 w-4" />
                        Sample
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                <ToolPanel title="Signature">
                    <div className="min-h-28 rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                        {signature ? <span className="break-all">{signature}</span> : <span className="text-muted-foreground">Signature will appear here...</span>}
                    </div>
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Message bytes" value={new TextEncoder().encode(message).length} />
                    <ToolMetric label="Secret bytes" value={new TextEncoder().encode(secret).length} />
                    <ToolMetric label="Signature length" value={signature.length} />
                </div>
            </div>
        </ToolLayout>
    );
}
