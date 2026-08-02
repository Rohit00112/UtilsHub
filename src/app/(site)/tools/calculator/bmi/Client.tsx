'use client';

import { Calculator } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

export default function BMICalculator() {
    const [weight, setWeight] = useToolState('bmi-calculator', 'weight', '');
    const [height, setHeight] = useToolState('bmi-calculator', 'height', '');
    const [unit, setUnit] = useToolState<'metric' | 'imperial'>('bmi-calculator', 'unit', 'metric');
    const [bmi, setBmi] = useToolState<number | null>('bmi-calculator', 'bmi', null);
    const [category, setCategory] = useToolState('bmi-calculator', 'category', '');

    const calculateBMI = () => {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        if (!w || !h) return;

        const bmiValue = unit === 'metric' ? w / ((h / 100) * (h / 100)) : (w / (h * h)) * 703;
        setBmi(parseFloat(bmiValue.toFixed(1)));

        if (bmiValue < 18.5) setCategory('Underweight');
        else if (bmiValue < 25) setCategory('Normal weight');
        else if (bmiValue < 30) setCategory('Overweight');
        else setCategory('Obese');
    };

    const categoryClass = category === 'Normal weight'
        ? 'text-emerald-600 dark:text-emerald-300'
        : category === 'Overweight'
            ? 'text-amber-600 dark:text-amber-300'
            : category
                ? 'text-destructive'
                : 'text-muted-foreground';

    return (
        <ToolLayout
            title="BMI Calculator"
            description="Calculate your Body Mass Index and check your weight category"
            category="calculator"
        >
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <ToolPanel title="Measurements">
                        <ToolActionBar className="mb-5">
                            <button className={`btn flex-1 ${unit === 'metric' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUnit('metric')}>
                                Metric
                            </button>
                            <button className={`btn flex-1 ${unit === 'imperial' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUnit('imperial')}>
                                Imperial
                            </button>
                        </ToolActionBar>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-muted-foreground">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</span>
                                <input type="number" value={weight} onChange={(event) => setWeight(event.target.value)} className="input h-10" placeholder="0" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-muted-foreground">Height ({unit === 'metric' ? 'cm' : 'inches'})</span>
                                <input type="number" value={height} onChange={(event) => setHeight(event.target.value)} className="input h-10" placeholder="0" />
                            </label>
                        </div>

                        <button onClick={calculateBMI} className="btn btn-primary mt-6 w-full gap-2">
                            <Calculator className="h-4 w-4" />
                            Calculate BMI
                        </button>
                    </ToolPanel>

                    <ToolPanel title="Result">
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-md border bg-muted/30 p-6 text-center">
                            {bmi ? (
                                <div className="animate-fade-in">
                                    <div className="text-sm font-medium text-muted-foreground">Your BMI</div>
                                    <div className="mt-2 text-7xl font-semibold text-foreground">{bmi}</div>
                                    <div className={`mt-4 text-2xl font-semibold ${categoryClass}`}>{category}</div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Enter your details to see your BMI.</p>
                            )}
                        </div>
                    </ToolPanel>
                </div>
            </div>
        </ToolLayout>
    );
}
