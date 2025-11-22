'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../../text/case-converter/case-converter.module.css';

export default function BMICalculator() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
    const [bmi, setBmi] = useState<number | null>(null);
    const [category, setCategory] = useState('');

    const calculateBMI = () => {
        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
            alert('Please enter valid weight and height');
            return;
        }

        let bmiValue: number;

        if (unit === 'metric') {
            // weight in kg, height in cm
            const heightInMeters = h / 100;
            bmiValue = w / (heightInMeters * heightInMeters);
        } else {
            // weight in lbs, height in inches
            bmiValue = (w / (h * h)) * 703;
        }

        setBmi(parseFloat(bmiValue.toFixed(1)));

        // Determine category
        if (bmiValue < 18.5) {
            setCategory('Underweight');
        } else if (bmiValue < 25) {
            setCategory('Normal weight');
        } else if (bmiValue < 30) {
            setCategory('Overweight');
        } else {
            setCategory('Obese');
        }
    };

    const getCategoryColor = () => {
        if (category === 'Underweight') return '#60a5fa';
        if (category === 'Normal weight') return '#34d399';
        if (category === 'Overweight') return '#fbbf24';
        return '#f87171';
    };

    return (
        <ToolLayout
            title="BMI Calculator"
            description="Calculate your Body Mass Index and check your weight category"
            category="calculator"
        >
            <div className={styles.tool}>
                <div className={styles.inputSection}>
                    <div className={styles.unitSelector}>
                        <button
                            className={`btn ${unit === 'metric' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setUnit('metric')}
                        >
                            Metric (kg, cm)
                        </button>
                        <button
                            className={`btn ${unit === 'imperial' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setUnit('imperial')}
                        >
                            Imperial (lbs, in)
                        </button>
                    </div>

                    <label className={styles.label} style={{ marginTop: '1.5rem' }}>
                        Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                    </label>
                    <input
                        type="number"
                        className="input"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                    />

                    <label className={styles.label} style={{ marginTop: '1.5rem' }}>
                        Height ({unit === 'metric' ? 'cm' : 'inches'})
                    </label>
                    <input
                        type="number"
                        className="input"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder={unit === 'metric' ? 'e.g., 175' : 'e.g., 69'}
                    />

                    <button
                        onClick={calculateBMI}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem' }}
                    >
                        📊 Calculate BMI
                    </button>
                </div>

                {bmi !== null && (
                    <div className={styles.outputSection}>
                        <div className={styles.bmiResult}>
                            <div className={styles.bmiValue}>{bmi}</div>
                            <div className={styles.bmiLabel}>Your BMI</div>
                        </div>
                        <div className={styles.categoryBadge} style={{ backgroundColor: getCategoryColor() }}>
                            {category}
                        </div>

                        <div className={styles.bmiChart}>
                            <h3>BMI Categories</h3>
                            <div className={styles.chartItem}>
                                <span className={styles.chartLabel}>Underweight</span>
                                <span className={styles.chartRange}>&lt; 18.5</span>
                            </div>
                            <div className={styles.chartItem}>
                                <span className={styles.chartLabel}>Normal weight</span>
                                <span className={styles.chartRange}>18.5 - 24.9</span>
                            </div>
                            <div className={styles.chartItem}>
                                <span className={styles.chartLabel}>Overweight</span>
                                <span className={styles.chartRange}>25 - 29.9</span>
                            </div>
                            <div className={styles.chartItem}>
                                <span className={styles.chartLabel}>Obese</span>
                                <span className={styles.chartRange}>&gt; 30</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .unitSelector {
          display: flex;
          gap: 1rem;
        }

        .bmiResult {
          text-align: center;
          padding: 2rem;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          margin-bottom: 1.5rem;
        }

        .bmiValue {
          font-size: 4rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .bmiLabel {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .categoryBadge {
          padding: 1rem;
          border-radius: var(--radius-md);
          text-align: center;
          font-weight: 700;
          font-size: 1.25rem;
          color: white;
          margin-bottom: 2rem;
        }

        .bmiChart {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .bmiChart h3 {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .chartItem {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .chartItem:last-child {
          border-bottom: none;
        }

        .chartLabel {
          color: var(--text-secondary);
        }

        .chartRange {
          color: var(--text-primary);
          font-weight: 600;
        }
      `}</style>
        </ToolLayout>
    );
}
