'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

interface JWTHeader {
    alg: string;
    typ: string;
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
    isExpired: boolean;
    expiresAt?: Date;
    issuedAt?: Date;
}

export default function JWTDecoder() {
    const [input, setInput] = useState('');
    const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
    const [error, setError] = useState('');
    const [copiedSection, setCopiedSection] = useState<string | null>(null);

    const base64UrlDecode = (str: string): string => {
        // Replace URL-safe characters and add padding
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }
        try {
            return decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
        } catch {
            return atob(base64);
        }
    };

    const decodeJWT = () => {
        setError('');
        setDecoded(null);

        const trimmedInput = input.trim();
        if (!trimmedInput) {
            setError('Please enter a JWT token');
            return;
        }

        const parts = trimmedInput.split('.');
        if (parts.length !== 3) {
            setError('Invalid JWT format. A JWT should have 3 parts separated by dots.');
            return;
        }

        try {
            const header = JSON.parse(base64UrlDecode(parts[0])) as JWTHeader;
            const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;
            const signature = parts[2];

            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp ? payload.exp < now : false;
            const expiresAt = payload.exp ? new Date(payload.exp * 1000) : undefined;
            const issuedAt = payload.iat ? new Date(payload.iat * 1000) : undefined;

            setDecoded({
                header,
                payload,
                signature,
                isExpired,
                expiresAt,
                issuedAt,
            });
        } catch {
            setError('Failed to decode JWT. The token may be malformed.');
        }
    };

    const copyToClipboard = async (section: string, content: string) => {
        await navigator.clipboard.writeText(content);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    const clearAll = () => {
        setInput('');
        setDecoded(null);
        setError('');
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'long',
        });
    };

    const getTimeRemaining = (exp: number): string => {
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

        return parts.join(' ');
    };

    return (
        <ToolLayout
            title="JWT Decoder"
            description="Decode and inspect JSON Web Tokens (JWT) to view header and payload"
            category="security"
        >
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Input Section */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6 transition-all duration-250 hover:border-primary/50">
                    <label htmlFor="input" className="block text-lg font-semibold text-text-primary mb-3">
                        JWT Token
                    </label>
                    <textarea
                        id="input"
                        className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-base font-mono resize-none transition-all duration-150 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                        rows={4}
                    />
                    <div className="flex gap-4 mt-4">
                        <button onClick={decodeJWT} className="btn btn-primary">
                            🔓 Decode JWT
                        </button>
                        <button onClick={clearAll} className="btn btn-secondary">
                            Clear
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-error/10 border-2 border-error/30 rounded-lg p-4 text-error">
                        ⚠️ {error}
                    </div>
                )}

                {/* Decoded Result */}
                {decoded && (
                    <div className="space-y-6">
                        {/* Status Banner */}
                        <div className={`rounded-lg p-4 border-2 ${decoded.isExpired
                            ? 'bg-error/10 border-error/30 text-error'
                            : 'bg-success/10 border-success/30 text-success'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">
                                    {decoded.isExpired ? '⚠️ Token Expired' : '✅ Token Valid'}
                                </span>
                                {decoded.payload.exp && (
                                    <span className="text-sm">
                                        {decoded.isExpired
                                            ? `Expired ${formatDate(decoded.expiresAt!)}`
                                            : `Expires in ${getTimeRemaining(decoded.payload.exp)}`}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Header Section */}
                        <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                                    <span className="text-2xl">📋</span> Header
                                    <span className="text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded">
                                        {decoded.header.alg}
                                    </span>
                                </h3>
                                <button
                                    onClick={() => copyToClipboard('header', JSON.stringify(decoded.header, null, 2))}
                                    className="px-3 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md text-primary-light font-medium text-sm transition-all duration-150"
                                >
                                    {copiedSection === 'header' ? '✓ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                            <pre className="p-4 bg-bg-tertiary rounded-md font-mono text-sm text-text-secondary overflow-x-auto">
                                {JSON.stringify(decoded.header, null, 2)}
                            </pre>
                        </div>

                        {/* Payload Section */}
                        <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                                    <span className="text-2xl">📦</span> Payload
                                </h3>
                                <button
                                    onClick={() => copyToClipboard('payload', JSON.stringify(decoded.payload, null, 2))}
                                    className="px-3 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md text-primary-light font-medium text-sm transition-all duration-150"
                                >
                                    {copiedSection === 'payload' ? '✓ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                            <pre className="p-4 bg-bg-tertiary rounded-md font-mono text-sm text-text-secondary overflow-x-auto">
                                {JSON.stringify(decoded.payload, null, 2)}
                            </pre>

                            {/* Claims Info */}
                            {(decoded.payload.iat || decoded.payload.exp || decoded.payload.iss || decoded.payload.sub) && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <h4 className="text-sm font-semibold text-text-primary mb-3">Standard Claims</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {decoded.payload.iss && (
                                            <div className="flex gap-2">
                                                <span className="text-text-tertiary">Issuer (iss):</span>
                                                <span className="text-text-secondary">{decoded.payload.iss}</span>
                                            </div>
                                        )}
                                        {decoded.payload.sub && (
                                            <div className="flex gap-2">
                                                <span className="text-text-tertiary">Subject (sub):</span>
                                                <span className="text-text-secondary">{decoded.payload.sub}</span>
                                            </div>
                                        )}
                                        {decoded.issuedAt && (
                                            <div className="flex gap-2">
                                                <span className="text-text-tertiary">Issued At (iat):</span>
                                                <span className="text-text-secondary">{formatDate(decoded.issuedAt)}</span>
                                            </div>
                                        )}
                                        {decoded.expiresAt && (
                                            <div className="flex gap-2">
                                                <span className="text-text-tertiary">Expires At (exp):</span>
                                                <span className="text-text-secondary">{formatDate(decoded.expiresAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Signature Section */}
                        <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                                    <span className="text-2xl">🔐</span> Signature
                                </h3>
                                <button
                                    onClick={() => copyToClipboard('signature', decoded.signature)}
                                    className="px-3 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md text-primary-light font-medium text-sm transition-all duration-150"
                                >
                                    {copiedSection === 'signature' ? '✓ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                            <div className="p-4 bg-bg-tertiary rounded-md font-mono text-sm text-text-secondary break-all">
                                {decoded.signature}
                            </div>
                            <p className="mt-3 text-xs text-text-tertiary">
                                ⚠️ Note: This tool only decodes JWTs. It does not verify the signature.
                            </p>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-bg-secondary border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">About JWT</h3>
                    <p className="text-sm text-text-secondary mb-4">
                        JSON Web Token (JWT) is an open standard (RFC 7519) for securely transmitting information
                        between parties as a JSON object. JWTs consist of three parts:
                    </p>
                    <ul className="space-y-2 text-sm text-text-secondary">
                        <li><strong className="text-text-primary">Header:</strong> Contains token type and signing algorithm</li>
                        <li><strong className="text-text-primary">Payload:</strong> Contains the claims (data)</li>
                        <li><strong className="text-text-primary">Signature:</strong> Verifies the token hasn&apos;t been tampered with</li>
                    </ul>
                </div>
            </div>
        </ToolLayout>
    );
}
