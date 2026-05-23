'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clipboard, RefreshCw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';

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
    const [copied, setCopied] = useState(false);

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
        setCopied(false);
        calculateStrength(generatedPassword);
    }, [length, options]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const strengthTone = strength === 'Strong' ? 'success' : strength === 'Medium' ? 'warning' : 'error';

    return (
        <ToolLayout
            title="Password Generator"
            description="Generate strong, random passwords with customizable options"
            category="security"
        >
            <div className="mx-auto max-w-4xl space-y-6">
                <ToolPanel
                    title="Generated password"
                    actions={(
                        <ToolActionBar>
                            <button onClick={generatePassword} className="btn btn-primary gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Generate
                            </button>
                            <button onClick={copyToClipboard} disabled={!password} className="btn btn-secondary gap-2">
                                <Clipboard className="h-4 w-4" />
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </ToolActionBar>
                    )}
                >
                    <div className="min-h-20 rounded-md border bg-muted/30 p-4 text-center font-mono text-2xl font-semibold text-foreground break-all sm:text-3xl">
                        {password || 'Select at least one character type.'}
                    </div>
                    {strength && (
                        <ToolStatus tone={strengthTone} className="mt-4">
                            Strength: {strength}
                        </ToolStatus>
                    )}
                </ToolPanel>

                <ToolPanel title="Password settings">
                    <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between">
                            <label htmlFor="length" className="text-sm font-medium text-muted-foreground">Length</label>
                            <span className="text-lg font-semibold text-foreground">{length}</span>
                        </div>
                        <input
                            id="length"
                            type="range"
                            min="4"
                            max="64"
                            value={length}
                            onChange={(event) => setLength(Number(event.target.value))}
                            className="w-full accent-current"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(options).map(([key, value]) => (
                            <label key={key} className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-3 text-sm font-medium capitalize text-foreground">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={() => setOptions((previous) => ({ ...previous, [key]: !previous[key as keyof typeof options] }))}
                                    className="h-4 w-4 accent-current"
                                />
                                {key}
                            </label>
                        ))}
                    </div>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
