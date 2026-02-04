'use client';

import { useState, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout';

interface AmortizationRow {
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
}

export default function EMICalculator() {
    const [principal, setPrincipal] = useState<number>(100000);
    const [interestRate, setInterestRate] = useState<number>(10);
    const [tenure, setTenure] = useState<number>(12);
    const [tenureType, setTenureType] = useState<'months' | 'years'>('months');
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
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Input Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-text-primary">Loan Details</h3>

                        {/* Principal Amount */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Loan Amount (Principal)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">₹</span>
                                <input
                                    type="number"
                                    value={principal}
                                    onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                                    className="w-full pl-8 pr-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-lg font-semibold focus:outline-none focus:border-primary"
                                    min="0"
                                />
                            </div>
                            <input
                                type="range"
                                min="10000"
                                max="10000000"
                                step="10000"
                                value={principal}
                                onChange={(e) => setPrincipal(Number(e.target.value))}
                                className="w-full mt-2 h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Interest Rate */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Interest Rate (% per annum)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                                    className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-lg font-semibold focus:outline-none focus:border-primary"
                                    min="0"
                                    max="50"
                                    step="0.1"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">%</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                step="0.5"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="w-full mt-2 h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Loan Tenure */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Loan Tenure
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    value={tenure}
                                    onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                                    className="flex-1 px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-lg font-semibold focus:outline-none focus:border-primary"
                                    min="1"
                                />
                                <div className="flex rounded-md border-2 border-border overflow-hidden">
                                    <button
                                        onClick={() => setTenureType('months')}
                                        className={`px-4 py-2 font-medium transition-colors ${tenureType === 'months'
                                                ? 'bg-primary text-white'
                                                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated'
                                            }`}
                                    >
                                        Months
                                    </button>
                                    <button
                                        onClick={() => setTenureType('years')}
                                        className={`px-4 py-2 font-medium transition-colors ${tenureType === 'years'
                                                ? 'bg-primary text-white'
                                                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated'
                                            }`}
                                    >
                                        Years
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* EMI Display */}
                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-lg p-6 text-center">
                            <p className="text-sm text-text-secondary mb-2">Monthly EMI</p>
                            <p className="text-4xl font-bold text-primary">
                                {formatCurrency(calculations.emi)}
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-bg-secondary border-2 border-border rounded-lg p-4 text-center">
                                <p className="text-xs text-text-tertiary mb-1">Principal Amount</p>
                                <p className="text-lg font-bold text-text-primary">{formatCurrency(principal)}</p>
                            </div>
                            <div className="bg-bg-secondary border-2 border-border rounded-lg p-4 text-center">
                                <p className="text-xs text-text-tertiary mb-1">Total Interest</p>
                                <p className="text-lg font-bold text-warning">{formatCurrency(calculations.totalInterest)}</p>
                            </div>
                            <div className="bg-bg-secondary border-2 border-border rounded-lg p-4 text-center col-span-2">
                                <p className="text-xs text-text-tertiary mb-1">Total Amount Payable</p>
                                <p className="text-2xl font-bold text-text-primary">{formatCurrency(calculations.totalAmount)}</p>
                            </div>
                        </div>

                        {/* Visual Breakdown */}
                        <div className="bg-bg-secondary border-2 border-border rounded-lg p-4">
                            <p className="text-sm font-medium text-text-secondary mb-3">Payment Breakdown</p>
                            <div className="h-4 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-primary transition-all duration-300"
                                    style={{ width: `${principalPercentage}%` }}
                                />
                                <div
                                    className="bg-warning transition-all duration-300"
                                    style={{ width: `${interestPercentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs">
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 bg-primary rounded-sm"></span>
                                    Principal ({formatNumber(principalPercentage)}%)
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 bg-warning rounded-sm"></span>
                                    Interest ({formatNumber(interestPercentage)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amortization Schedule Toggle */}
                <div className="text-center">
                    <button
                        onClick={() => setShowAmortization(!showAmortization)}
                        className="btn btn-secondary"
                    >
                        {showAmortization ? '🔼 Hide' : '🔽 Show'} Amortization Schedule
                    </button>
                </div>

                {/* Amortization Schedule */}
                {showAmortization && calculations.amortization.length > 0 && (
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-6 overflow-x-auto">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">
                            Amortization Schedule ({calculations.months} months)
                        </h3>
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Month</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">EMI</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">Principal</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">Interest</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculations.amortization.map((row) => (
                                    <tr key={row.month} className="border-b border-border/50 hover:bg-bg-tertiary/50">
                                        <td className="py-3 px-4 text-sm text-text-primary">{row.month}</td>
                                        <td className="py-3 px-4 text-sm text-text-primary text-right">{formatCurrency(row.emi)}</td>
                                        <td className="py-3 px-4 text-sm text-primary text-right">{formatCurrency(row.principal)}</td>
                                        <td className="py-3 px-4 text-sm text-warning text-right">{formatCurrency(row.interest)}</td>
                                        <td className="py-3 px-4 text-sm text-text-secondary text-right">{formatCurrency(row.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-bg-secondary border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">About EMI</h3>
                    <p className="text-sm text-text-secondary mb-4">
                        EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender
                        at a specified date each calendar month. EMIs are used to pay off both interest and principal
                        each month so that over a specified number of years, the loan is paid off in full.
                    </p>
                    <div className="p-4 bg-bg-tertiary rounded-lg">
                        <p className="text-sm font-semibold text-text-primary mb-2">EMI Formula:</p>
                        <p className="font-mono text-sm text-text-secondary">
                            EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)
                        </p>
                        <p className="text-xs text-text-tertiary mt-2">
                            Where P = Principal, r = Monthly interest rate, n = Number of months
                        </p>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
