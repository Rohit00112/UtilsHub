'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../../text/case-converter/case-converter.module.css';

export default function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [strength, setStrength] = useState('');

    const generatePassword = () => {
        let charset = '';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (charset === '') {
            alert('Please select at least one character type');
            return;
        }

        let generatedPassword = '';
        for (let i = 0; i < length; i++) {
            generatedPassword += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        setPassword(generatedPassword);
        calculateStrength(generatedPassword);
    };

    const calculateStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (pwd.length >= 16) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        if (score <= 2) setStrength('Weak');
        else if (score <= 4) setStrength('Medium');
        else setStrength('Strong');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
    };

    return (
        <ToolLayout
            title="Password Generator"
            description="Generate strong, random passwords with customizable options"
            category="security"
        >
            <div className={styles.tool}>
                <div className={styles.inputSection}>
                    <label className={styles.label}>Password Length: {length}</label>
                    <input
                        type="range"
                        min="4"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className={styles.slider}
                    />

                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={includeUppercase}
                                onChange={(e) => setIncludeUppercase(e.target.checked)}
                            />
                            <span>Uppercase (A-Z)</span>
                        </label>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={includeLowercase}
                                onChange={(e) => setIncludeLowercase(e.target.checked)}
                            />
                            <span>Lowercase (a-z)</span>
                        </label>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={includeNumbers}
                                onChange={(e) => setIncludeNumbers(e.target.checked)}
                            />
                            <span>Numbers (0-9)</span>
                        </label>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={includeSymbols}
                                onChange={(e) => setIncludeSymbols(e.target.checked)}
                            />
                            <span>Symbols (!@#$%...)</span>
                        </label>
                    </div>

                    <button onClick={generatePassword} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                        🔐 Generate Password
                    </button>
                </div>

                {password && (
                    <div className={styles.outputSection}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Generated Password</label>
                            <button onClick={copyToClipboard} className={styles.copyBtn}>
                                📋 Copy
                            </button>
                        </div>
                        <div className={styles.passwordDisplay}>
                            <code>{password}</code>
                        </div>
                        <div className={`${styles.strengthBadge} ${styles[strength.toLowerCase()]}`}>
                            Strength: {strength}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .slider {
          width: 100%;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--bg-tertiary);
          outline: none;
          margin: 1rem 0;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
        }

        .checkboxGroup {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .checkbox input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .passwordDisplay {
          padding: 1.5rem;
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          font-family: var(--font-mono);
          font-size: 1.5rem;
          text-align: center;
          word-break: break-all;
          color: var(--color-primary-light);
        }

        .strengthBadge {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          text-align: center;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .weak {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
          border: 2px solid rgba(239, 68, 68, 0.3);
        }

        .medium {
          background: rgba(251, 191, 36, 0.1);
          color: var(--color-warning);
          border: 2px solid rgba(251, 191, 36, 0.3);
        }

        .strong {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
          border: 2px solid rgba(34, 197, 94, 0.3);
        }
      `}</style>
        </ToolLayout>
    );
}
