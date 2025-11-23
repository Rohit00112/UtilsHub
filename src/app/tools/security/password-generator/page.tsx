'use client';

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });
    const [strength, setStrength] = useState('');

    const generatePassword = useCallback(() => {
        const charset = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        };

        let chars = '';
        if (options.uppercase) chars += charset.uppercase;
        if (options.lowercase) chars += charset.lowercase;
        if (options.numbers) chars += charset.numbers;
        if (options.symbols) chars += charset.symbols;

        if (chars === '') {
            setPassword('');
            setStrength('');
            return;
        }

        let generatedPassword = '';
        for (let i = 0; i < length; i++) {
            generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setPassword(generatedPassword);
        calculateStrength(generatedPassword);
    }, [length, options]);

    const calculateStrength = (pass: string) => {
        let score = 0;
        if (pass.length > 8) score++;
        if (pass.length > 12) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score < 3) setStrength('Weak');
        else if (score < 5) setStrength('Medium');
        else setStrength('Strong');
    };

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
    };

    return (
        <ToolLayout
            title="Password Generator"
            description="Generate strong, random passwords with customizable options"
            category="security"
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Password Display */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-8 text-center transition-all duration-250 hover:border-primary/50">
                    <div className="text-4xl font-mono font-bold text-text-primary break-all mb-4 min-h-[3rem] flex items-center justify-center">
                        {password}
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={generatePassword}
                            className="btn btn-primary"
                        >
                            🔄 Generate New
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className="btn btn-secondary"
                        >
                            📋 Copy
                        </button>
                    </div>
                    {strength && (
                        <div className={`mt-4 inline-block px-4 py-1 rounded-full text-sm font-bold ${strength === 'Strong' ? 'bg-success/20 text-success' :
                                strength === 'Medium' ? 'bg-warning/20 text-warning' :
                                    'bg-error/20 text-error'
                            }`}>
                            Strength: {strength}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-8">
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            <label className="text-lg font-semibold text-text-primary">Password Length</label>
                            <span className="text-primary font-bold text-xl">{length}</span>
                        </div>
                        <input
                            type="range"
                            min="4"
                            max="64"
                            value={length}
                            onChange={(e) => setLength(Number(e.target.value))}
                            className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(options).map(([key, value]) => (
                            <label key={key} className="flex items-center p-4 bg-bg-tertiary rounded-lg cursor-pointer transition-all duration-150 hover:bg-bg-elevated border border-transparent hover:border-primary/30">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={() => setOptions(prev => ({ ...prev, [key]: !prev[key as keyof typeof options] }))}
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 bg-bg-primary"
                                />
                                <span className="ml-3 text-text-primary capitalize font-medium">{key}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
