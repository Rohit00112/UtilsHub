'use client';

import { useState } from 'react';
import { Binary, Check, Clipboard, Eraser } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolField, ToolPanel } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type BaseKey = 'bin' | 'oct' | 'dec' | 'hex';

const bases: Array<{ key: BaseKey; label: string; radix: number; placeholder: string }> = [
    { key: 'bin', label: 'Binary (base 2)', radix: 2, placeholder: '101010' },
    { key: 'oct', label: 'Octal (base 8)', radix: 8, placeholder: '52' },
    { key: 'dec', label: 'Decimal (base 10)', radix: 10, placeholder: '42' },
    { key: 'hex', label: 'Hexadecimal (base 16)', radix: 16, placeholder: '2a' },
];

const emptyValues: Record<BaseKey, string> = { bin: '', oct: '', dec: '', hex: '' };

function isValidForRadix(value: string, radix: number) {
    if (value === '') return true;
    try {
        for (const ch of value.toLowerCase()) {
            const digit = parseInt(ch, radix);
            if (Number.isNaN(digit) || digit >= radix) return false;
        }
        return true;
    } catch {
        return false;
    }
}

function toBig(value: string, radix: number): bigint | null {
    if (value === '') return null;
    let result = BigInt(0);
    const big = BigInt(radix);
    for (const ch of value.toLowerCase()) {
        const digit = parseInt(ch, radix);
        if (Number.isNaN(digit) || digit >= radix) return null;
        result = result * big + BigInt(digit);
    }
    return result;
}

export default function NumberBaseConverter() {
    const [values, setValues] = useToolState<Record<BaseKey, string>>('number-base-converter', 'values', { ...emptyValues });
    const [error, setError] = useState<BaseKey | null>(null);
    const [copied, setCopied] = useState<BaseKey | null>(null);

    const handleChange = (key: BaseKey, raw: string) => {
        const base = bases.find((b) => b.key === key)!;
        const trimmed = raw.trim();
        if (!isValidForRadix(trimmed, base.radix)) {
            setError(key);
            setValues((prev) => ({ ...prev, [key]: raw }));
            return;
        }
        setError(null);
        if (trimmed === '') {
            setValues({ ...emptyValues });
            return;
        }
        const big = toBig(trimmed, base.radix);
        if (big === null) {
            setError(key);
            setValues((prev) => ({ ...prev, [key]: raw }));
            return;
        }
        const next: Record<BaseKey, string> = { bin: '', oct: '', dec: '', hex: '' };
        for (const b of bases) {
            next[b.key] = b.key === key ? raw : big.toString(b.radix);
        }
        setValues(next);
    };

    const copyValue = async (key: BaseKey) => {
        await navigator.clipboard.writeText(values[key]);
        setCopied(key);
        window.setTimeout(() => setCopied(null), 1600);
    };

    const clearAll = () => {
        setValues({ ...emptyValues });
        setError(null);
        setCopied(null);
    };

    return (
        <ToolLayout title="Number Base Converter" description="Convert between binary, octal, decimal, and hexadecimal" category="developer">
            <div className="mx-auto max-w-3xl space-y-6">
                <ToolPanel title="Bases" description="Type a number into any field — the others update instantly.">
                    <div className="grid gap-5">
                        {bases.map((base) => (
                            <ToolField key={base.key} label={base.label} htmlFor={`base-${base.key}`}>
                                <div className="flex items-center gap-2">
                                    <input
                                        id={`base-${base.key}`}
                                        type="text"
                                        inputMode={base.radix === 10 ? 'numeric' : 'text'}
                                        autoComplete="off"
                                        spellCheck={false}
                                        value={values[base.key]}
                                        onChange={(e) => handleChange(base.key, e.target.value)}
                                        placeholder={base.placeholder}
                                        className={`input h-10 flex-1 font-mono ${error === base.key ? 'border-destructive text-destructive' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => copyValue(base.key)}
                                        disabled={!values[base.key] || error === base.key}
                                        className="btn btn-secondary h-10 gap-2"
                                    >
                                        {copied === base.key ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                    </button>
                                </div>
                                {error === base.key && (
                                    <p className="mt-1 text-xs text-destructive">Not a valid base-{base.radix} number.</p>
                                )}
                            </ToolField>
                        ))}
                    </div>
                    <div className="mt-5 flex">
                        <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                            <Eraser className="h-4 w-4" />
                            Clear
                        </button>
                    </div>
                </ToolPanel>

                <ToolPanel title="Tip">
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Binary className="mt-0.5 h-4 w-4 shrink-0" />
                        Hex is case-insensitive (2a and 2A are equal). Values are parsed as exact big integers, so large numbers convert without rounding.
                    </p>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
