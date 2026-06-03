'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
} from '@/components/tools/ToolPrimitives';

type CalculationMode = 'exclusive' | 'inclusive';
type SupplyType = 'intra' | 'inter';

const modeOptions: Array<{ label: string; value: CalculationMode }> = [
    { label: 'Add GST', value: 'exclusive' },
    { label: 'Remove GST', value: 'inclusive' },
];

const supplyOptions: Array<{ label: string; value: SupplyType }> = [
    { label: 'CGST + SGST', value: 'intra' },
    { label: 'IGST', value: 'inter' },
];

const commonRates = [0, 5, 12, 18, 28];

function toNumber(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatPercent(value: number) {
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
    }).format(value);
}

export default function GSTCalculator() {
    const [amount, setAmount] = useState('10000');
    const [gstRate, setGstRate] = useState('18');
    const [cessRate, setCessRate] = useState('0');
    const [mode, setMode] = useState<CalculationMode>('exclusive');
    const [supplyType, setSupplyType] = useState<SupplyType>('intra');
    const [copied, setCopied] = useState(false);

    const result = useMemo(() => {
        const inputAmount = Math.max(0, toNumber(amount));
        const gst = clamp(toNumber(gstRate), 0, 100);
        const cess = clamp(toNumber(cessRate), 0, 100);
        const combinedRate = gst + cess;

        const taxableValue = mode === 'inclusive' && combinedRate > 0
            ? inputAmount / (1 + combinedRate / 100)
            : inputAmount;
        const gstAmount = taxableValue * (gst / 100);
        const cessAmount = taxableValue * (cess / 100);
        const totalTax = gstAmount + cessAmount;
        const totalAmount = mode === 'inclusive' ? inputAmount : taxableValue + totalTax;
        const halfGst = gstAmount / 2;

        return {
            taxableValue,
            gstAmount,
            cessAmount,
            totalTax,
            totalAmount,
            cgst: supplyType === 'intra' ? halfGst : 0,
            sgst: supplyType === 'intra' ? halfGst : 0,
            igst: supplyType === 'inter' ? gstAmount : 0,
            effectiveRate: combinedRate,
        };
    }, [amount, cessRate, gstRate, mode, supplyType]);

    const copyBreakdown = async () => {
        const lines = [
            `Mode: ${mode === 'exclusive' ? 'Add GST' : 'Remove GST'}`,
            `GST rate: ${formatPercent(toNumber(gstRate))}%`,
            `Cess rate: ${formatPercent(toNumber(cessRate))}%`,
            `Taxable value: ${formatCurrency(result.taxableValue)}`,
            `GST amount: ${formatCurrency(result.gstAmount)}`,
            supplyType === 'intra'
                ? `CGST: ${formatCurrency(result.cgst)} | SGST: ${formatCurrency(result.sgst)}`
                : `IGST: ${formatCurrency(result.igst)}`,
            `Cess: ${formatCurrency(result.cessAmount)}`,
            `Total tax: ${formatCurrency(result.totalTax)}`,
            `Total amount: ${formatCurrency(result.totalAmount)}`,
        ];

        await navigator.clipboard.writeText(lines.join('\n'));
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setAmount('');
        setGstRate('18');
        setCessRate('0');
        setCopied(false);
    };

    return (
        <ToolLayout
            title="GST Calculator"
            description="Add or remove GST and see CGST, SGST, IGST, and cess breakdowns"
            category="calculator"
        >
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel
                    title="Calculation setup"
                    actions={<ToolSegmentedControl value={mode} options={modeOptions} onChange={setMode} />}
                >
                    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <LabeledInput
                                label={mode === 'exclusive' ? 'Taxable amount' : 'Tax-inclusive amount'}
                                value={amount}
                                onChange={setAmount}
                                prefix="INR"
                                min="0"
                                step="0.01"
                            />
                            <LabeledInput
                                label="GST rate"
                                value={gstRate}
                                onChange={setGstRate}
                                suffix="%"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                            <LabeledInput
                                label="Compensation cess"
                                value={cessRate}
                                onChange={setCessRate}
                                suffix="%"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Supply type</p>
                                <ToolSegmentedControl value={supplyType} options={supplyOptions} onChange={setSupplyType} />
                            </div>
                        </div>

                        <div className="rounded-md border bg-muted/20 p-4">
                            <p className="text-xs font-medium uppercase text-muted-foreground">Common GST rates</p>
                            <div className="mt-3 grid grid-cols-5 gap-2">
                                {commonRates.map((rate) => (
                                    <button
                                        key={rate}
                                        type="button"
                                        onClick={() => setGstRate(String(rate))}
                                        className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${toNumber(gstRate) === rate ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {rate}%
                                    </button>
                                ))}
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Use the GST rate that applies to your item or service. The presets cover common slabs only.
                            </p>
                        </div>
                    </div>
                </ToolPanel>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ToolMetric label="Taxable value" value={formatCurrency(result.taxableValue)} />
                    <ToolMetric label="GST amount" value={formatCurrency(result.gstAmount)} description={`${formatPercent(toNumber(gstRate))}% GST`} />
                    <ToolMetric label="Total tax" value={formatCurrency(result.totalTax)} description={`${formatPercent(result.effectiveRate)}% effective`} />
                    <ToolMetric label="Total amount" value={formatCurrency(result.totalAmount)} />
                </div>

                <ToolPanel
                    title="Tax breakdown"
                    actions={(
                        <ToolActionBar>
                            <button type="button" onClick={clearAll} className="btn btn-secondary h-8 gap-2 px-3">
                                <Eraser className="h-4 w-4" />
                                Clear
                            </button>
                            <button type="button" onClick={copyBreakdown} className="btn btn-primary h-8 gap-2 px-3">
                                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </ToolActionBar>
                    )}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px]">
                            <tbody className="divide-y">
                                <BreakdownRow label="Taxable value" value={formatCurrency(result.taxableValue)} />
                                {supplyType === 'intra' ? (
                                    <>
                                        <BreakdownRow label={`CGST (${formatPercent(toNumber(gstRate) / 2)}%)`} value={formatCurrency(result.cgst)} />
                                        <BreakdownRow label={`SGST (${formatPercent(toNumber(gstRate) / 2)}%)`} value={formatCurrency(result.sgst)} />
                                    </>
                                ) : (
                                    <BreakdownRow label={`IGST (${formatPercent(toNumber(gstRate))}%)`} value={formatCurrency(result.igst)} />
                                )}
                                <BreakdownRow label={`Cess (${formatPercent(toNumber(cessRate))}%)`} value={formatCurrency(result.cessAmount)} />
                                <BreakdownRow label="Total tax" value={formatCurrency(result.totalTax)} strong />
                                <BreakdownRow label="Invoice total" value={formatCurrency(result.totalAmount)} strong />
                            </tbody>
                        </table>
                    </div>
                </ToolPanel>

                <ToolPanel title="GST formula">
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormulaCard
                            title="Add GST"
                            formula="Total = Taxable value + GST + cess"
                        />
                        <FormulaCard
                            title="Remove GST"
                            formula="Taxable value = Inclusive total / (1 + combined tax rate)"
                        />
                    </div>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}

function LabeledInput({
    label,
    value,
    onChange,
    prefix,
    suffix,
    min,
    max,
    step,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    prefix?: string;
    suffix?: string;
    min?: string;
    max?: string;
    step?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-foreground">{label}</span>
            <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">{prefix}</span>}
                <input
                    type="number"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={`input h-10 text-base font-semibold ${prefix ? 'pl-12' : ''} ${suffix ? 'pr-8' : ''}`}
                    min={min}
                    max={max}
                    step={step}
                    placeholder="0"
                />
                {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{suffix}</span>}
            </div>
        </label>
    );
}

function BreakdownRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <tr>
            <td className={`px-3 py-3 text-sm ${strong ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</td>
            <td className={`px-3 py-3 text-right text-sm tabular-nums ${strong ? 'font-semibold text-foreground' : 'text-foreground'}`}>{value}</td>
        </tr>
    );
}

function FormulaCard({ title, formula }: { title: string; formula: string }) {
    return (
        <div className="rounded-md border bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">{formula}</p>
        </div>
    );
}
