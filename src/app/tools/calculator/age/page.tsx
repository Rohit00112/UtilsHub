'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../../text/case-converter/case-converter.module.css';

export default function AgeCalculator() {
    const [birthDate, setBirthDate] = useState('');
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
    const [result, setResult] = useState<any>(null);

    const calculateAge = () => {
        if (!birthDate) {
            alert('Please enter your birth date');
            return;
        }

        const birth = new Date(birthDate);
        const target = new Date(targetDate);

        if (birth > target) {
            alert('Birth date cannot be after target date');
            return;
        }

        const diffTime = Math.abs(target.getTime() - birth.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let years = target.getFullYear() - birth.getFullYear();
        let months = target.getMonth() - birth.getMonth();
        let days = target.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
            days += prevMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const totalMonths = years * 12 + months;
        const totalWeeks = Math.floor(diffDays / 7);
        const totalHours = diffDays * 24;
        const totalMinutes = totalHours * 60;

        setResult({
            years,
            months,
            days,
            totalDays: diffDays,
            totalMonths,
            totalWeeks,
            totalHours,
            totalMinutes,
        });
    };

    return (
        <ToolLayout
            title="Age Calculator"
            description="Calculate your exact age in years, months, days, and more"
            category="calculator"
        >
            <div className={styles.tool}>
                <div className={styles.inputSection}>
                    <label className={styles.label}>Birth Date</label>
                    <input
                        type="date"
                        className="input"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                    />

                    <label className={styles.label} style={{ marginTop: '1.5rem' }}>
                        Calculate Age As Of
                    </label>
                    <input
                        type="date"
                        className="input"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                    />

                    <button
                        onClick={calculateAge}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem' }}
                    >
                        🎂 Calculate Age
                    </button>
                </div>

                {result && (
                    <div className={styles.outputSection}>
                        <div className={styles.ageDisplay}>
                            <div className={styles.mainAge}>
                                <span className={styles.ageNumber}>{result.years}</span>
                                <span className={styles.ageUnit}>years</span>
                                <span className={styles.ageNumber}>{result.months}</span>
                                <span className={styles.ageUnit}>months</span>
                                <span className={styles.ageNumber}>{result.days}</span>
                                <span className={styles.ageUnit}>days</span>
                            </div>
                        </div>

                        <div className={styles.detailedStats}>
                            <h3 className={styles.label}>Detailed Breakdown</h3>
                            <div className={styles.statGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{result.totalMonths}</div>
                                    <div className={styles.statLabel}>Total Months</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{result.totalWeeks.toLocaleString()}</div>
                                    <div className={styles.statLabel}>Total Weeks</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{result.totalDays.toLocaleString()}</div>
                                    <div className={styles.statLabel}>Total Days</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{result.totalHours.toLocaleString()}</div>
                                    <div className={styles.statLabel}>Total Hours</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{result.totalMinutes.toLocaleString()}</div>
                                    <div className={styles.statLabel}>Total Minutes</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .ageDisplay {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .mainAge {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ageNumber {
          font-size: 3rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ageUnit {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-right: 1rem;
        }

        .detailedStats {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .statGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .statItem {
          text-align: center;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .statValue {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-primary-light);
          margin-bottom: 0.5rem;
        }

        .statLabel {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
        </ToolLayout>
    );
}
