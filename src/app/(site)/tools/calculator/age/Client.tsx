'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolField, ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

interface AgeResult {
    years: number;
    months: number;
    days: number;
    asOfDate: string;
}

function parseDateInput(value: string) {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

function formatDateInput(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
    const date = parseDateInput(value);
    if (!date) return value;
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function addMonthsClamped(date: Date, monthsToAdd: number) {
    const year = date.getFullYear();
    const month = date.getMonth() + monthsToAdd;
    const targetYear = year + Math.floor(month / 12);
    const targetMonth = ((month % 12) + 12) % 12;
    const targetDay = Math.min(date.getDate(), daysInMonth(targetYear, targetMonth));

    return new Date(targetYear, targetMonth, targetDay);
}

function addYearsClamped(date: Date, yearsToAdd: number) {
    const targetYear = date.getFullYear() + yearsToAdd;
    const targetMonth = date.getMonth();
    const targetDay = Math.min(date.getDate(), daysInMonth(targetYear, targetMonth));

    return new Date(targetYear, targetMonth, targetDay);
}

function differenceInCalendarDays(start: Date, end: Date) {
    const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.round((endUtc - startUtc) / 86400000);
}

export default function AgeCalculator() {
    const [birthDate, setBirthDate] = useToolState('age-calculator', 'birthDate', '');
    const [targetDate, setTargetDate] = useToolState('age-calculator', 'targetDate', '');
    const [age, setAge] = useToolState<AgeResult | null>('age-calculator', 'age', null);
    const [error, setError] = useState('');

    const calculateAge = () => {
        if (!birthDate) {
            setAge(null);
            setError('Choose a date of birth first.');
            return;
        }

        const birth = parseDateInput(birthDate);
        const targetInput = targetDate || formatDateInput(new Date());
        const target = parseDateInput(targetInput);

        if (!birth || !target) {
            setAge(null);
            setError('Enter valid dates before calculating.');
            return;
        }

        if (target < birth) {
            setAge(null);
            setError('The as-of date must be the same as or after the date of birth.');
            return;
        }

        let years = target.getFullYear() - birth.getFullYear();
        let yearAnchor = addYearsClamped(birth, years);

        if (yearAnchor > target) {
            years--;
            yearAnchor = addYearsClamped(birth, years);
        }

        let months = 0;
        let monthAnchor = yearAnchor;
        let nextMonthAnchor = addMonthsClamped(yearAnchor, months + 1);

        while (nextMonthAnchor <= target && months < 11) {
            months++;
            monthAnchor = nextMonthAnchor;
            nextMonthAnchor = addMonthsClamped(yearAnchor, months + 1);
        }

        const days = differenceInCalendarDays(monthAnchor, target);

        setError('');
        setAge({ years, months, days, asOfDate: targetInput });
    };

    return (
        <ToolLayout
            title="Age Calculator"
            description="Calculate exact age in years, months, and days on any date"
            category="calculator"
        >
            <div className="mx-auto max-w-4xl space-y-6">
                <ToolPanel title="Age details" description="Select a date of birth and optionally calculate age on a specific date.">
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <ToolField label="Date of birth" htmlFor="birth-date">
                            <input
                                id="birth-date"
                                type="date"
                                value={birthDate}
                                max={targetDate || undefined}
                                onChange={(event) => {
                                    setBirthDate(event.target.value);
                                    setError('');
                                }}
                                className="input h-10"
                            />
                        </ToolField>

                        <ToolField label="As of date" description="Leave blank to use today." htmlFor="target-date">
                            <input
                                id="target-date"
                                type="date"
                                value={targetDate}
                                min={birthDate || undefined}
                                onChange={(event) => {
                                    setTargetDate(event.target.value);
                                    setError('');
                                }}
                                className="input h-10"
                            />
                        </ToolField>

                        <button type="button" onClick={calculateAge} className="btn btn-primary gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Calculate
                        </button>
                    </div>
                </ToolPanel>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                {age && (
                    <div className="space-y-3">
                        <p className="text-center text-sm text-muted-foreground">
                            Age as of {formatDisplayDate(age.asOfDate)}
                        </p>
                        <div className="grid gap-4 md:grid-cols-3">
                            <AgeMetric label="Years" value={age.years} />
                            <AgeMetric label="Months" value={age.months} />
                            <AgeMetric label="Days" value={age.days} />
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}

function AgeMetric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border bg-card p-6 text-center">
            <div className="text-5xl font-semibold text-foreground">{value}</div>
            <div className="mt-2 text-sm font-medium text-muted-foreground">{label}</div>
        </div>
    );
}
