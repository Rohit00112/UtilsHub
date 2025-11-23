'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function BMICalculator() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
    const [bmi, setBmi] = useState<number | null>(null);
    const [category, setCategory] = useState('');

    const calculateBMI = () => {
        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (!w || !h) return;

        let bmiValue = 0;
        if (unit === 'metric') {
            // Weight in kg, Height in cm
            bmiValue = w / ((h / 100) * (h / 100));
        } else {
            // Weight in lbs, Height in inches
            bmiValue = (w / (h * h)) * 703;
        }

        setBmi(parseFloat(bmiValue.toFixed(1)));

        if (bmiValue < 18.5) setCategory('Underweight');
        else if (bmiValue < 25) setCategory('Normal weight');
        else if (bmiValue < 30) setCategory('Overweight');
        else setCategory('Obese');
    };

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Underweight': return 'text-blue-400';
            case 'Normal weight': return 'text-green-400';
            case 'Overweight': return 'text-yellow-400';
            case 'Obese': return 'text-red-400';
            default: return 'text-text-primary';
        }
    };

    return (
        <ToolLayout
            title="BMI Calculator"
            description="Calculate your Body Mass Index and check your weight category"
            category="calculator"
        >
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-8">
                        <div className="flex gap-4 mb-6">
                            <button
                                className={`btn flex-1 ${unit === 'metric' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setUnit('metric')}
                            >
                                Metric (kg/cm)
                            </button>
                            <button
                                className={`btn flex-1 ${unit === 'imperial' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setUnit('imperial')}
                            >
                                Imperial (lbs/in)
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-text-secondary font-medium mb-2">
                                    Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                                </label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="input"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-text-secondary font-medium mb-2">
                                    Height ({unit === 'metric' ? 'cm' : 'inches'})
                                </label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="input"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <button onClick={calculateBMI} className="btn btn-primary w-full">
                            Calculate BMI
                        </button>
                    </div>

                    {/* Result Section */}
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-8 flex flex-col items-center justify-center text-center">
                        {bmi ? (
                            <div className="animate-fade-in">
                                <div className="text-text-secondary mb-2 uppercase tracking-wider font-semibold">Your BMI</div>
                                <div className="text-8xl font-extrabold text-gradient mb-4">{bmi}</div>
                                <div className={`text-2xl font-bold ${getCategoryColor(category)}`}>
                                    {category}
                                </div>
                            </div>
                        ) : (
                            <div className="text-text-tertiary">
                                <div className="text-6xl mb-4 opacity-20">⚖️</div>
                                <p>Enter your details to see your BMI</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
