'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

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
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-8 text-center">
                    <label className="block text-xl font-semibold text-text-primary mb-4">
                        Select Your Date of Birth
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-6">
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="input text-center text-lg"
                        />
                        <button onClick={calculateAge} className="btn btn-primary w-full sm:w-auto">
                            Calculate Age
                        </button>
                    </div>
                </div>

                {age && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                        <div className="bg-bg-secondary border-2 border-border rounded-lg p-8 text-center transition-all duration-250 hover:-translate-y-1 hover:border-primary">
                            <div className="text-6xl font-extrabold text-gradient mb-2">{age.years}</div>
                            <div className="text-text-secondary uppercase tracking-wider font-semibold">Years</div>
                        </div>
                        <div className="bg-bg-secondary border-2 border-border rounded-lg p-8 text-center transition-all duration-250 hover:-translate-y-1 hover:border-primary">
                            <div className="text-6xl font-extrabold text-gradient mb-2">{age.months}</div>
                            <div className="text-text-secondary uppercase tracking-wider font-semibold">Months</div>
                        </div>
                        <div className="bg-bg-secondary border-2 border-border rounded-lg p-8 text-center transition-all duration-250 hover:-translate-y-1 hover:border-primary">
                            <div className="text-6xl font-extrabold text-gradient mb-2">{age.days}</div>
                            <div className="text-text-secondary uppercase tracking-wider font-semibold">Days</div>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
