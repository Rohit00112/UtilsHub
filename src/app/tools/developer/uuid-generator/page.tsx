'use client';

import { useState } from 'react';
import { Check, Clipboard, Download, RefreshCw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7, validate, version as uuidVersion } from 'uuid';

type UUIDVersion = 'v1' | 'v4' | 'v7';
type LetterCase = 'lower' | 'upper';

interface GeneratedUuid {
    id: string;
    raw: string;
}

const versionLabels: Record<UUIDVersion, string> = {
    v1: 'UUID v1 (timestamp)',
    v4: 'UUID v4 (random)',
    v7: 'UUID v7 (time ordered)',
};

export default function UuidGenerator() {
    const [uuids, setUuids] = useState<GeneratedUuid[]>([]);
    const [count, setCount] = useState('5');
    const [selectedVersion, setSelectedVersion] = useState<UUIDVersion>('v4');
    const [letterCase, setLetterCase] = useState<LetterCase>('lower');
    const [includeHyphens, setIncludeHyphens] = useState(true);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const formatUuid = (uuid: string) => {
        const withHyphenSetting = includeHyphens ? uuid : uuid.replace(/-/g, '');
        return letterCase === 'upper' ? withHyphenSetting.toUpperCase() : withHyphenSetting.toLowerCase();
    };

    const generateRawUuid = () => {
        if (selectedVersion === 'v1') return uuidv1();
        if (selectedVersion === 'v7') return uuidv7();
        return uuidv4();
    };

    const validateCount = () => {
        const parsed = Number(count);
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > 500) {
            return null;
        }
        return parsed;
    };

    const generate = () => {
        const parsedCount = validateCount();
        if (!parsedCount) {
            setError('Enter a whole number from 1 to 500.');
            return;
        }

        setError('');
        const generated = Array.from({ length: parsedCount }, () => {
            const raw = generateRawUuid();
            return {
                id: raw,
                raw,
            };
        });
        setUuids(generated);
        setCopiedId(null);
    };

    const copyText = async (id: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1800);
        } catch {
            setError('Clipboard access was blocked by the browser.');
        }
    };

    const copyAll = () => {
        const text = uuids.map((item) => formatUuid(item.raw)).join('\n');
        copyText('all', text);
    };

    const downloadTxt = () => {
        const text = uuids.map((item) => formatUuid(item.raw)).join('\n');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `uuids-${selectedVersion}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const versionSummary = uuids.length > 0
        ? `${uuids.length} generated, UUID version ${uuidVersion(uuids[0].raw)}`
        : 'Generate identifiers to inspect the result set.';

    return (
        <ToolLayout title="UUID Generator" description="Generate and format unique identifiers for applications" category="developer">
            <div className="mx-auto max-w-5xl space-y-6">
                <section className="rounded-lg border bg-card p-5 sm:p-6">
                    <div className="grid gap-4 lg:grid-cols-[1fr_160px_auto]">
                        <div>
                            <label htmlFor="version" className="mb-2 block text-sm font-medium text-muted-foreground">
                                Version
                            </label>
                            <select
                                id="version"
                                value={selectedVersion}
                                onChange={(event) => setSelectedVersion(event.target.value as UUIDVersion)}
                                className="input h-10"
                            >
                                {Object.entries(versionLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-muted-foreground">
                                Quantity
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                max="500"
                                value={count}
                                onChange={(event) => setCount(event.target.value)}
                                className="input h-10"
                            />
                        </div>

                        <div className="flex items-end">
                            <button onClick={generate} className="btn btn-primary h-10 gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Generate
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4">
                        <fieldset className="flex rounded-md border bg-muted/30 p-1">
                            {(['lower', 'upper'] as LetterCase[]).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setLetterCase(option)}
                                    className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${letterCase === option ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {option === 'lower' ? 'lowercase' : 'UPPERCASE'}
                                </button>
                            ))}
                        </fieldset>

                        <label className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={includeHyphens}
                                onChange={(event) => setIncludeHyphens(event.target.checked)}
                                className="h-4 w-4 accent-current"
                            />
                            Include hyphens
                        </label>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </section>

                <section className="rounded-lg border bg-card">
                    <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Generated UUIDs</h3>
                            <p className="text-sm text-muted-foreground">{versionSummary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={copyAll} disabled={uuids.length === 0} className="btn btn-secondary gap-2">
                                {copiedId === 'all' ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                {copiedId === 'all' ? 'Copied' : 'Copy all'}
                            </button>
                            <button onClick={downloadTxt} disabled={uuids.length === 0} className="btn btn-secondary gap-2">
                                <Download className="h-4 w-4" />
                                Download .txt
                            </button>
                        </div>
                    </div>

                    {uuids.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Choose a version and quantity, then generate a batch.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {uuids.map((item, index) => {
                                const formatted = formatUuid(item.raw);
                                const isValid = validate(item.raw);

                                return (
                                    <div key={item.id} className="grid gap-3 p-4 md:grid-cols-[80px_1fr_auto] md:items-center">
                                        <div className="text-sm font-medium text-muted-foreground">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <div className="break-all font-mono text-sm text-foreground">{formatted}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {isValid ? `Valid UUID v${uuidVersion(item.raw)}` : 'Invalid UUID'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyText(item.id, formatted)}
                                            className="btn btn-secondary h-8 gap-2 justify-self-start px-3 md:justify-self-end"
                                        >
                                            {copiedId === item.id ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                            {copiedId === item.id ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </ToolLayout>
    );
}
