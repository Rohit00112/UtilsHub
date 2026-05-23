'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolPanel } from '@/components/tools/ToolPrimitives';

export default function AgeCalculator() {
    const [birthDate, setBirthDate] = useState('');
    const [age, setAge] = useState<{ years: number; months: number; days: number } | null>(null);

    const calculateAge = () => {
        if (!birthDate) return;

        const birth = new Date(birthDate);
        const today = new Date();

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (months < 0 || (months === 0 && days < 0)) {
            years--;
            months += 12;
        }

        if (days < 0) {
            const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0);
            days += prevMonth.getDate();
            months--;
        }

        setAge({ years, months, days });
    };

    return (
        <ToolLayout
            title="Age Calculator"
            description="Calculate your exact age in years, months, and days"
            category="calculator"
        >
            <div className="mx-auto max-w-4xl space-y-6">
                <ToolPanel title="Date of birth" description="Select a date, then calculate the elapsed time.">
                    <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(event) => setBirthDate(event.target.value)}
                            className="input h-10 text-center"
                        />
                        <button onClick={calculateAge} className="btn btn-primary gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Calculate
                        </button>
                    </div>
                </ToolPanel>

                {age && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <AgeMetric label="Years" value={age.years} />
                        <AgeMetric label="Months" value={age.months} />
                        <AgeMetric label="Days" value={age.days} />
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
