'use client';

import { useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Clipboard,
    Eraser,
    FileJson2,
    KeyRound,
    Play,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolPanel } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

interface JWTHeader {
    alg?: string;
    typ?: string;
    [key: string]: unknown;
}

interface JWTPayload {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: unknown;
}

interface DecodedJWT {
    header: JWTHeader;
    payload: JWTPayload;
    signature: string;
    signingInput: string;
    token: string;
    isExpired: boolean;
    isNotYetValid: boolean;
    isActive: boolean;
    expiresAt?: Date;
    issuedAt?: Date;
    notBefore?: Date;
    warnings: string[];
}

type VerificationState = 'idle' | 'valid' | 'invalid' | 'unsupported' | 'error';

const SAMPLE_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const hmacAlgorithms: Record<string, string> = {
    HS256: 'SHA-256',
    HS384: 'SHA-384',
    HS512: 'SHA-512',
};

function base64UrlToBytes(segment: string): Uint8Array {
    const remainder = segment.length % 4;
    if (remainder === 1) {
        throw new Error('Invalid base64url segment length.');
    }

    const padded = segment
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(segment.length + ((4 - remainder) % 4), '=');

    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return buffer;
}

function base64UrlDecode(segment: string): string {
    return new TextDecoder().decode(base64UrlToBytes(segment));
}

function claimDate(value: unknown): Date | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? new Date(value * 1000) : undefined;
}

function formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'long',
    });
}

function getTimeRemaining(exp: number): string {
    const now = Math.floor(Date.now() / 1000);
    const diff = exp - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 && days === 0) parts.push(`${seconds}s`);

    return parts.join(' ') || 'less than 1s';
}

function parseToken(token: string): DecodedJWT {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
        throw new Error('Please enter a JWT token.');
    }

    const parts = trimmedToken.split('.');
    if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
        throw new Error('Invalid JWT format. A JWT must have three dot-separated parts.');
    }

    let header: JWTHeader;
    let payload: JWTPayload;

    try {
        header = JSON.parse(base64UrlDecode(parts[0])) as JWTHeader;
    } catch {
        throw new Error('The JWT header is not valid base64url-encoded JSON.');
    }

    try {
        payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;
    } catch {
        throw new Error('The JWT payload is not valid base64url-encoded JSON.');
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = claimDate(payload.exp);
    const issuedAt = claimDate(payload.iat);
    const notBefore = claimDate(payload.nbf);
    const isExpired = typeof payload.exp === 'number' ? payload.exp < now : false;
    const isNotYetValid = typeof payload.nbf === 'number' ? payload.nbf > now : false;
    const warnings: string[] = [];

    if (payload.exp !== undefined && !expiresAt) warnings.push('The exp claim is present but is not a valid numeric timestamp.');
    if (payload.iat !== undefined && !issuedAt) warnings.push('The iat claim is present but is not a valid numeric timestamp.');
    if (payload.nbf !== undefined && !notBefore) warnings.push('The nbf claim is present but is not a valid numeric timestamp.');
    if (typeof payload.iat === 'number' && payload.iat > now) warnings.push('The iat claim is in the future.');
    if (!header.alg) warnings.push('The header does not declare a signing algorithm.');
    if (header.alg === 'none') warnings.push('This token declares alg none and has no cryptographic signature.');

    return {
        header,
        payload,
        signature: parts[2],
        signingInput: `${parts[0]}.${parts[1]}`,
        token: trimmedToken,
        isExpired,
        isNotYetValid,
        isActive: !isExpired && !isNotYetValid,
        expiresAt,
        issuedAt,
        notBefore,
        warnings,
    };
}

export default function JWTDecoder() {
    const [input, setInput] = useToolState('jwt-decoder', 'input', '');
    const [decoded, setDecoded] = useToolState<DecodedJWT | null>('jwt-decoder', 'decoded', null);
    const [secret, setSecret] = useToolState('jwt-decoder', 'secret', '');
    const [error, setError] = useState('');
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [verificationState, setVerificationState] = useState<VerificationState>('idle');
    const [verificationMessage, setVerificationMessage] = useState('');

    const decodeJWT = () => {
        setError('');
        setVerificationState('idle');
        setVerificationMessage('');

        try {
            setDecoded(parseToken(input));
        } catch (err) {
            setDecoded(null);
            setError(err instanceof Error ? err.message : 'Failed to decode JWT.');
        }
    };

    const verifySignature = async () => {
        setError('');
        setVerificationState('idle');
        setVerificationMessage('');

        let parsed: DecodedJWT;
        try {
            parsed = parseToken(input);
            setDecoded(parsed);
        } catch (err) {
            setDecoded(null);
            setError(err instanceof Error ? err.message : 'Failed to decode JWT before verification.');
            return;
        }

        const alg = parsed.header.alg;
        if (!alg || !hmacAlgorithms[alg]) {
            setVerificationState('unsupported');
            setVerificationMessage('Signature verification is available for HS256, HS384, and HS512 tokens only.');
            return;
        }

        if (!secret) {
            setVerificationState('error');
            setVerificationMessage('Enter the shared secret used to sign this token.');
            return;
        }

        try {
            const key = await crypto.subtle.importKey(
                'raw',
                bytesToArrayBuffer(new TextEncoder().encode(secret)),
                { name: 'HMAC', hash: hmacAlgorithms[alg] },
                false,
                ['verify']
            );

            const isValid = await crypto.subtle.verify(
                'HMAC',
                key,
                bytesToArrayBuffer(base64UrlToBytes(parsed.signature)),
                bytesToArrayBuffer(new TextEncoder().encode(parsed.signingInput))
            );

            setVerificationState(isValid ? 'valid' : 'invalid');
            setVerificationMessage(isValid ? 'Signature verified with the provided secret.' : 'Signature does not match the provided secret.');
        } catch {
            setVerificationState('error');
            setVerificationMessage('Unable to verify the signature. Check the token signature and secret.');
        }
    };

    const copyToClipboard = async (section: string, content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedSection(section);
            setTimeout(() => setCopiedSection(null), 2000);
        } catch {
            setError('Clipboard access was blocked by the browser.');
        }
    };

    const loadSample = () => {
        setInput(SAMPLE_TOKEN);
        setSecret('your-256-bit-secret');
        setError('');
        setVerificationState('idle');
        setVerificationMessage('');
        setDecoded(parseToken(SAMPLE_TOKEN));
    };

    const clearAll = () => {
        setInput('');
        setSecret('');
        setDecoded(null);
        setError('');
        setVerificationState('idle');
        setVerificationMessage('');
    };

    const statusLabel = decoded?.isExpired
        ? 'Expired'
        : decoded?.isNotYetValid
            ? 'Not active yet'
            : decoded
                ? 'Active window'
                : 'Waiting for token';

    return (
        <ToolLayout
            title="JWT Decoder"
            description="Decode, inspect, and verify JSON Web Tokens directly in your browser"
            category="security"
        >
            <div className="max-w-6xl mx-auto space-y-6">
                <ToolPanel title="JWT token" description="Paste a compact JWS token with header, payload, and signature segments.">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <button onClick={loadSample} className="btn btn-secondary gap-2 self-start">
                            <Play className="h-4 w-4" />
                            Load sample
                        </button>
                    </div>

                    <textarea
                        id="input"
                        className="mt-4 min-h-32 w-full rounded-md border border-input bg-background px-4 py-3 font-mono text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />

                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                        <div>
                            <label htmlFor="secret" className="mb-2 block text-sm font-medium text-muted-foreground">
                                HMAC secret for optional HS256, HS384, or HS512 verification
                            </label>
                            <input
                                id="secret"
                                type="password"
                                value={secret}
                                onChange={(event) => setSecret(event.target.value)}
                                className="input h-10"
                                placeholder="Shared signing secret"
                            />
                        </div>
                        <div className="flex flex-wrap items-end gap-2">
                            <button onClick={decodeJWT} className="btn btn-primary gap-2 h-10">
                                <FileJson2 className="h-4 w-4" />
                                Decode
                            </button>
                            <button onClick={verifySignature} className="btn btn-secondary gap-2 h-10">
                                <KeyRound className="h-4 w-4" />
                                Verify
                            </button>
                            <button onClick={clearAll} className="btn btn-secondary gap-2 h-10">
                                <Eraser className="h-4 w-4" />
                                Clear
                            </button>
                        </div>
                    </div>
                </ToolPanel>

                {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {decoded && (
                    <div className="space-y-6">
                        <section className="grid gap-3 md:grid-cols-3">
                            <div className={`rounded-lg border p-4 ${decoded.isActive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    {decoded.isActive ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                    {statusLabel}
                                </div>
                                <p className="mt-2 text-xs">
                                    {decoded.expiresAt
                                        ? decoded.isExpired
                                            ? `Expired ${formatDate(decoded.expiresAt)}`
                                            : `Expires in ${getTimeRemaining(decoded.payload.exp as number)}`
                                        : 'No exp claim is present.'}
                                </p>
                            </div>

                            <div className={`rounded-lg border p-4 ${verificationState === 'valid' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : verificationState === 'invalid' || verificationState === 'error' ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-border bg-muted/40 text-muted-foreground'}`}>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    {verificationState === 'valid' ? <ShieldCheck className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                                    Signature
                                </div>
                                <p className="mt-2 text-xs">
                                    {verificationMessage || `Algorithm: ${decoded.header.alg || 'not declared'}`}
                                </p>
                            </div>

                            <div className="rounded-lg border bg-muted/40 p-4">
                                <div className="text-sm font-semibold text-foreground">Registered claims</div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {[
                                        decoded.payload.iss && 'iss',
                                        decoded.payload.sub && 'sub',
                                        decoded.payload.aud && 'aud',
                                        decoded.payload.iat && 'iat',
                                        decoded.payload.nbf && 'nbf',
                                        decoded.payload.exp && 'exp',
                                    ].filter(Boolean).join(', ') || 'No registered claims found.'}
                                </p>
                            </div>
                        </section>

                        {decoded.warnings.length > 0 && (
                            <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                                <div className="mb-2 flex items-center gap-2 font-semibold">
                                    <AlertCircle className="h-4 w-4" />
                                    Token notes
                                </div>
                                <ul className="list-disc space-y-1 pl-5">
                                    {decoded.warnings.map((warning) => (
                                        <li key={warning}>{warning}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <div className="grid gap-6 lg:grid-cols-2">
                            <JsonPanel
                                title="Header"
                                badge={decoded.header.alg || 'alg missing'}
                                content={JSON.stringify(decoded.header, null, 2)}
                                copied={copiedSection === 'header'}
                                onCopy={() => copyToClipboard('header', JSON.stringify(decoded.header, null, 2))}
                            />
                            <JsonPanel
                                title="Payload"
                                badge={decoded.payload.sub || decoded.payload.iss || 'claims'}
                                content={JSON.stringify(decoded.payload, null, 2)}
                                copied={copiedSection === 'payload'}
                                onCopy={() => copyToClipboard('payload', JSON.stringify(decoded.payload, null, 2))}
                            />
                        </div>

                        <section className="rounded-lg border bg-card p-5">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
                                <button
                                    onClick={() => copyToClipboard('token', decoded.token)}
                                    className="btn btn-secondary gap-2 self-start"
                                >
                                    <Clipboard className="h-4 w-4" />
                                    {copiedSection === 'token' ? 'Copied' : 'Copy token'}
                                </button>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                                <ClaimDate label="Issued at" value={decoded.issuedAt} empty="No iat claim" />
                                <ClaimDate label="Not before" value={decoded.notBefore} empty="No nbf claim" />
                                <ClaimDate label="Expires at" value={decoded.expiresAt} empty="No exp claim" />
                            </div>
                        </section>

                        <section className="rounded-lg border bg-card p-5">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-lg font-semibold text-foreground">Signature segment</h3>
                                <button
                                    onClick={() => copyToClipboard('signature', decoded.signature)}
                                    className="btn btn-secondary gap-2 self-start"
                                >
                                    <Clipboard className="h-4 w-4" />
                                    {copiedSection === 'signature' ? 'Copied' : 'Copy signature'}
                                </button>
                            </div>
                            <div className="break-all rounded-md bg-muted p-4 font-mono text-sm text-muted-foreground">
                                {decoded.signature}
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                Decoding shows token contents. Verification only proves HS* signatures when the correct shared secret is provided.
                            </p>
                        </section>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}

function JsonPanel({
    title,
    badge,
    content,
    copied,
    onCopy,
}: {
    title: string;
    badge: string;
    content: string;
    copied: boolean;
    onCopy: () => void;
}) {
    return (
        <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <span className="truncate rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {badge}
                    </span>
                </div>
                <button onClick={onCopy} className="btn btn-secondary gap-2 h-8 px-3">
                    <Clipboard className="h-4 w-4" />
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-sm text-muted-foreground">
                {content}
            </pre>
        </section>
    );
}

function ClaimDate({ label, value, empty }: { label: string; value?: Date; empty: string }) {
    return (
        <div className="rounded-md border bg-muted/40 p-4">
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="mt-1 text-sm text-muted-foreground">
                {value ? formatDate(value) : empty}
            </div>
        </div>
    );
}
