'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolPanel } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

interface AmortizationRow {
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
}

export default function EMICalculator() {
    const [principal, setPrincipal] = useToolState<number>('emi-calculator', 'principal', 100000);
    const [interestRate, setInterestRate] = useToolState<number>('emi-calculator', 'interestRate', 10);
    const [tenure, setTenure] = useToolState<number>('emi-calculator', 'tenure', 12);
    const [tenureType, setTenureType] = useToolState<'months' | 'years'>('emi-calculator', 'tenureType', 'months');
    const [showAmortization, setShowAmortization] = useState(false);

    const calculations = useMemo(() => {
        const months = tenureType === 'years' ? tenure * 12 : tenure;
        const monthlyRate = interestRate / 12 / 100;

        if (months <= 0 || principal <= 0) {
            return {
                emi: 0,
                totalAmount: 0,
                totalInterest: 0,
                months: 0,
                amortization: [],
            };
        }

        // EMI Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
        let emi: number;
        if (monthlyRate === 0) {
            emi = principal / months;
        } else {
            const compoundFactor = Math.pow(1 + monthlyRate, months);
            emi = (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);
        }

        const totalAmount = emi * months;
        const totalInterest = totalAmount - principal;

        // Generate amortization schedule
        const amortization: AmortizationRow[] = [];
        let balance = principal;

        for (let month = 1; month <= months; month++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = emi - interestPayment;
            balance = Math.max(0, balance - principalPayment);

            amortization.push({
                month,
                emi,
                principal: principalPayment,
                interest: interestPayment,
                balance,
            });
        }

        return {
            emi,
            totalAmount,
            totalInterest,
            months,
            amortization,
        };
    }, [principal, interestRate, tenure, tenureType]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2,
        }).format(num);
    };

    const principalPercentage = calculations.totalAmount > 0
        ? (principal / calculations.totalAmount) * 100
        : 0;
    const interestPercentage = 100 - principalPercentage;

    return (
        <ToolLayout
            title="EMI Calculator"
            description="Calculate your Equated Monthly Installment (EMI) for loans with detailed amortization schedule"
            category="calculator"
        >
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <ToolPanel title="Loan details">
                        <div className="space-y-6">
                            <LabeledNumber label="Loan amount" prefix="₹" value={principal} onChange={setPrincipal} min={0} />
                            <input type="range" min="10000" max="10000000" step="10000" value={principal} onChange={(event) => setPrincipal(Number(event.target.value))} className="w-full accent-current" />

                            <LabeledNumber label="Interest rate" suffix="%" value={interestRate} onChange={setInterestRate} min={0} max={50} step={0.1} />
                            <input type="range" min="1" max="30" step="0.5" value={interestRate} onChange={(event) => setInterestRate(Number(event.target.value))} className="w-full accent-current" />

                            <div>
                                <label className="mb-2 block text-sm font-medium text-muted-foreground">Loan tenure</label>
                                <div className="flex gap-3">
                                    <input type="number" value={tenure} onChange={(event) => setTenure(Math.max(1, Number(event.target.value)))} className="input h-10" min="1" />
                                    <div className="flex overflow-hidden rounded-md border">
                                        <button onClick={() => setTenureType('months')} className={`px-4 text-sm font-medium ${tenureType === 'months' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>Months</button>
                                        <button onClick={() => setTenureType('years')} className={`px-4 text-sm font-medium ${tenureType === 'years' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>Years</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ToolPanel>

                    <div className="space-y-6">
                        <ToolPanel>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Monthly EMI</p>
                                <p className="mt-2 text-4xl font-semibold text-foreground">{formatCurrency(calculations.emi)}</p>
                            </div>
                        </ToolPanel>

                        <div className="grid grid-cols-2 gap-4">
                            <Metric label="Principal amount" value={formatCurrency(principal)} />
                            <Metric label="Total interest" value={formatCurrency(calculations.totalInterest)} muted />
                            <div className="col-span-2">
                                <Metric label="Total amount payable" value={formatCurrency(calculations.totalAmount)} large />
                            </div>
                        </div>

                        <ToolPanel title="Payment breakdown" className="p-4 sm:p-4">
                            <div className="flex h-4 overflow-hidden rounded-full bg-muted">
                                <div className="bg-primary transition-all duration-300" style={{ width: `${principalPercentage}%` }} />
                                <div className="bg-amber-500 transition-all duration-300" style={{ width: `${interestPercentage}%` }} />
                            </div>
                            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                <span>Principal ({formatNumber(principalPercentage)}%)</span>
                                <span>Interest ({formatNumber(interestPercentage)}%)</span>
                            </div>
                        </ToolPanel>
                    </div>
                </div>

                <div className="text-center">
                    <button onClick={() => setShowAmortization(!showAmortization)} className="btn btn-secondary gap-2">
                        {showAmortization ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {showAmortization ? 'Hide' : 'Show'} amortization schedule
                    </button>
                </div>

                {showAmortization && calculations.amortization.length > 0 && (
                    <ToolPanel title={`Amortization schedule (${calculations.months} months)`}>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Month</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">EMI</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Principal</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Interest</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calculations.amortization.map((row) => (
                                        <tr key={row.month} className="border-b hover:bg-muted/40">
                                            <td className="px-4 py-3 text-sm text-foreground">{row.month}</td>
                                            <td className="px-4 py-3 text-right text-sm text-foreground">{formatCurrency(row.emi)}</td>
                                            <td className="px-4 py-3 text-right text-sm text-foreground">{formatCurrency(row.principal)}</td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">{formatCurrency(row.interest)}</td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">{formatCurrency(row.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ToolPanel>
                )}

                <ToolPanel title="About EMI">
                    <p className="text-sm text-muted-foreground">
                        EMI is a fixed payment made each month. It pays down both interest and principal until the loan is paid in full.
                    </p>
                    <div className="mt-4 rounded-md bg-muted/40 p-4">
                        <p className="text-sm font-semibold text-foreground">EMI Formula</p>
                        <p className="mt-2 font-mono text-sm text-muted-foreground">EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)</p>
                    </div>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}

function LabeledNumber({
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
    value: number;
    onChange: (value: number) => void;
    prefix?: string;
    suffix?: string;
    min?: number;
    max?: number;
    step?: number;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-foreground">{label}</span>
            <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{prefix}</span>}
                <input
                    type="number"
                    value={value}
                    onChange={(event) => onChange(Math.max(min || 0, Number(event.target.value)))}
                    className={`input h-10 text-base font-semibold ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
                    min={min}
                    max={max}
                    step={step}
                />
                {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{suffix}</span>}
            </div>
        </label>
    );
}

function Metric({ label, value, muted, large }: { label: string; value: string; muted?: boolean; large?: boolean }) {
    return (
        <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`${large ? 'text-2xl' : 'text-lg'} mt-1 font-semibold ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>{value}</p>
        </div>
    );
}
