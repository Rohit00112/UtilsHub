'use client';

import { useState } from 'react';
import { Check, Clipboard, RotateCcw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
} from '@/components/tools/ToolPrimitives';

type Unit = 'px' | 'rem' | 'em' | 'percent' | 'vw' | 'vh';

const unitOptions: Array<{ label: string; value: Unit }> = [
    { label: 'px', value: 'px' },
    { label: 'rem', value: 'rem' },
    { label: 'em', value: 'em' },
    { label: '%', value: 'percent' },
    { label: 'vw', value: 'vw' },
    { label: 'vh', value: 'vh' },
];

const unitLabels: Record<Unit, string> = {
    px: 'px',
    rem: 'rem',
    em: 'em',
    percent: '%',
    vw: 'vw',
    vh: 'vh',
};

function parseNumber(value: string, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function formatNumber(value: number) {
    if (!Number.isFinite(value)) return '0';
    return Number(value.toFixed(6)).toString();
}

function toPixels({
    value,
    unit,
    rootFontSize,
    parentFontSize,
    parentSize,
    viewportWidth,
    viewportHeight,
}: {
    value: number;
    unit: Unit;
    rootFontSize: number;
    parentFontSize: number;
    parentSize: number;
    viewportWidth: number;
    viewportHeight: number;
}) {
    if (unit === 'rem') return value * rootFontSize;
    if (unit === 'em') return value * parentFontSize;
    if (unit === 'percent') return (value / 100) * parentSize;
    if (unit === 'vw') return (value / 100) * viewportWidth;
    if (unit === 'vh') return (value / 100) * viewportHeight;
    return value;
}

export default function CssUnitConverter() {
    const [value, setValue] = useState('16');
    const [unit, setUnit] = useState<Unit>('px');
    const [rootFontSize, setRootFontSize] = useState('16');
    const [parentFontSize, setParentFontSize] = useState('16');
    const [parentSize, setParentSize] = useState('320');
    const [viewportWidth, setViewportWidth] = useState('1440');
    const [viewportHeight, setViewportHeight] = useState('900');
    const [copied, setCopied] = useState<string | null>(null);

    const numericValue = parseNumber(value, 0);
    const context = {
        rootFontSize: parseNumber(rootFontSize, 16),
        parentFontSize: parseNumber(parentFontSize, 16),
        parentSize: parseNumber(parentSize, 320),
        viewportWidth: parseNumber(viewportWidth, 1440),
        viewportHeight: parseNumber(viewportHeight, 900),
    };

    const px = toPixels({ value: numericValue, unit, ...context });

    const rows = [
        { unit: 'px' as Unit, value: px },
        { unit: 'rem' as Unit, value: px / context.rootFontSize },
        { unit: 'em' as Unit, value: px / context.parentFontSize },
        { unit: 'percent' as Unit, value: (px / context.parentSize) * 100 },
        { unit: 'vw' as Unit, value: (px / context.viewportWidth) * 100 },
        { unit: 'vh' as Unit, value: (px / context.viewportHeight) * 100 },
    ];

    const hasInvalidContext = [
        context.rootFontSize,
        context.parentFontSize,
        context.parentSize,
        context.viewportWidth,
        context.viewportHeight,
    ].some((item) => item <= 0);

    const copyValue = async (id: string, text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        window.setTimeout(() => setCopied(null), 1600);
    };

    const resetContext = () => {
        setRootFontSize('16');
        setParentFontSize('16');
        setParentSize('320');
        setViewportWidth('1440');
        setViewportHeight('900');
    };

    return (
        <ToolLayout title="CSS Unit Converter" description="Convert px, rem, em, percent, vw, and vh using live CSS context" category="developer">
            <div className="mx-auto max-w-5xl space-y-6">
            
                <ToolPanel title="Source value" description="Enter the value you have and choose its current CSS unit.">
                    <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
                        <ToolField label="Value" htmlFor="source-value">
                            <input
                                id="source-value"
                                type="number"
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                                className="input h-11 font-mono text-lg tabular-nums"
                            />
                        </ToolField>
                        <ToolSegmentedControl value={unit} options={unitOptions} onChange={setUnit} />
                    </div>
                </ToolPanel>

                <ToolPanel
                    title="Conversion context"
                    description="CSS units depend on font sizes, parent dimensions, and viewport dimensions."
                    actions={
                        <button type="button" onClick={resetContext} className="btn btn-secondary gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    }
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <NumberField label="Root font" suffix="px" value={rootFontSize} onChange={setRootFontSize} />
                        <NumberField label="Parent font" suffix="px" value={parentFontSize} onChange={setParentFontSize} />
                        <NumberField label="Parent size" suffix="px" value={parentSize} onChange={setParentSize} />
                        <NumberField label="Viewport width" suffix="px" value={viewportWidth} onChange={setViewportWidth} />
                        <NumberField label="Viewport height" suffix="px" value={viewportHeight} onChange={setViewportHeight} />
                    </div>
                </ToolPanel>

                {hasInvalidContext && (
                    <ToolStatus tone="error">
                        Context values must be greater than zero for accurate conversions.
                    </ToolStatus>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Pixel baseline" value={`${formatNumber(px)}px`} />
                    <ToolMetric label="Root font" value={`${formatNumber(context.rootFontSize)}px`} />
                    <ToolMetric label="Viewport" value={`${formatNumber(context.viewportWidth)} x ${formatNumber(context.viewportHeight)}`} />
                </div>

                <ToolPanel title="Converted values" description="Copy any value as a ready-to-use CSS length.">
                    <div className="divide-y divide-border">
                        {rows.map((row) => {
                            const label = unitLabels[row.unit];
                            const formatted = `${formatNumber(row.value)}${label}`;
                            return (
                                <div key={row.unit} className="grid gap-3 py-3 sm:grid-cols-[90px_1fr_auto] sm:items-center">
                                    <div className="font-mono text-sm font-medium text-muted-foreground">{label}</div>
                                    <div className="break-all font-mono text-sm text-foreground">{formatted}</div>
                                    <button
                                        type="button"
                                        onClick={() => copyValue(row.unit, formatted)}
                                        className="btn btn-secondary h-8 gap-2 justify-self-start px-3 sm:justify-self-end"
                                    >
                                        {copied === row.unit ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                        {copied === row.unit ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}

function NumberField({
    label,
    suffix,
    value,
    onChange,
}: {
    label: string;
    suffix: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <ToolField label={label}>
            <div className="flex h-10 items-center rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
                <input
                    type="number"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-1 font-mono text-sm tabular-nums outline-none"
                />
                <span className="border-l px-3 text-sm text-muted-foreground">{suffix}</span>
            </div>
        </ToolField>
    );
}
