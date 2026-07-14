'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ToolField, ToolMetric, ToolPanel, ToolSegmentedControl } from '@/components/tools/ToolPrimitives';

type Mode = 'of' | 'isWhat' | 'change';

const modeOptions: Array<{ label: string; value: Mode }> = [
    { label: '% of', value: 'of' },
    { label: 'is what %', value: 'isWhat' },
    { label: '% change', value: 'change' },
];

function fmt(n: number) {
    if (!Number.isFinite(n)) return '—';
    return Number(n.toFixed(4)).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function num(v: string): number | null {
    if (v.trim() === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

export default function PercentageCalculator() {
    const [mode, setMode] = useState<Mode>('of');
    const [a, setA] = useState('15');
    const [b, setB] = useState('200');

    const result = useMemo(() => {
        const x = num(a);
        const y = num(b);
        if (x === null || y === null) return { value: null as number | null, formula: '', label: '' };

        if (mode === 'of') {
            return { value: (x / 100) * y, formula: `${fmt(x)}% × ${fmt(y)} = (${fmt(x)} ÷ 100) × ${fmt(y)}`, label: `${fmt(x)}% of ${fmt(y)}` };
        }
        if (mode === 'isWhat') {
            if (y === 0) return { value: null, formula: 'Cannot divide by zero', label: '' };
            return { value: (x / y) * 100, formula: `${fmt(x)} ÷ ${fmt(y)} × 100`, label: `${fmt(x)} is what % of ${fmt(y)}` };
        }
        // change
        if (x === 0) return { value: null, formula: 'Old value is zero — change is undefined', label: '' };
        return { value: ((y - x) / x) * 100, formula: `(${fmt(y)} − ${fmt(x)}) ÷ ${fmt(x)} × 100`, label: `Change from ${fmt(x)} to ${fmt(y)}` };
    }, [mode, a, b]);

    const labels: Record<Mode, { a: string; b: string; ph1: string; ph2: string }> = {
        of: { a: 'Percent (%)', b: 'Of value', ph1: '15', ph2: '200' },
        isWhat: { a: 'Value', b: 'Of total', ph1: '30', ph2: '200' },
        change: { a: 'Old value', b: 'New value', ph1: '200', ph2: '250' },
    };
    const cur = labels[mode];

    const resultSuffix = mode === 'of' ? '' : '%';

    return (
        <ToolLayout title="Percentage Calculator" description="Solve percentage-of, is-what-percent, and percentage-change problems" category="calculator">
            <div className="mx-auto max-w-3xl space-y-6">
                <ToolPanel title="What do you want to calculate?">
                    <ToolSegmentedControl value={mode} options={modeOptions} onChange={setMode} />
                </ToolPanel>

                <ToolPanel title="Values">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <ToolField label={cur.a} htmlFor="pc-a">
                            <input id="pc-a" type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder={cur.ph1} className="input h-10" />
                        </ToolField>
                        <ToolField label={cur.b} htmlFor="pc-b">
                            <input id="pc-b" type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder={cur.ph2} className="input h-10" />
                        </ToolField>
                    </div>
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-2">
                    <ToolMetric
                        label={result.label || 'Result'}
                        value={result.value === null ? '—' : `${fmt(result.value)}${resultSuffix}`}
                    />
                    <ToolMetric label="Formula" value={<span className="text-base font-normal">{result.formula || '—'}</span>} />
                </div>
            </div>
        </ToolLayout>
    );
}
