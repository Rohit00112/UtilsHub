'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';

interface Match {
    match: string;
    index: number;
    groups: string[];
}

const COMMON_PATTERNS = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
    { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'g' },
    { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g' },
    { name: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', flags: 'g' },
    { name: 'IPv4', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', flags: 'g' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
];

export default function RegexTester() {
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false, y: false });
    const [testString, setTestString] = useState('');
    const [matches, setMatches] = useState<Match[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!pattern || !testString) {
            setMatches([]);
            setError('');
            return;
        }

        try {
            const flagString = Object.entries(flags)
                .filter(([_, enabled]) => enabled)
                .map(([flag]) => flag)
                .join('');

            const regex = new RegExp(pattern, flagString);
            const foundMatches: Match[] = [];

            if (flags.g) {
                let match;
                while ((match = regex.exec(testString)) !== null) {
                    foundMatches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1)
                    });
                }
            } else {
                const match = regex.exec(testString);
                if (match) {
                    foundMatches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1)
                    });
                }
            }

            setMatches(foundMatches);
            setError('');
        } catch (e) {
            setError((e as Error).message);
            setMatches([]);
        }
    }, [pattern, flags, testString]);

    const toggleFlag = (flag: keyof typeof flags) => {
        setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
    };

    const loadPattern = (commonPattern: typeof COMMON_PATTERNS[0]) => {
        setPattern(commonPattern.pattern);
        const newFlags = { g: false, i: false, m: false, s: false, u: false, y: false };
        commonPattern.flags.split('').forEach(f => {
            newFlags[f as keyof typeof flags] = true;
        });
        setFlags(newFlags);
    };

    const highlightMatches = () => {
        if (matches.length === 0) return testString;

        const parts: JSX.Element[] = [];
        let lastIndex = 0;

        matches.forEach((match, idx) => {
            if (match.index > lastIndex) {
                parts.push(<span key={`text-${idx}`}>{testString.slice(lastIndex, match.index)}</span>);
            }
            parts.push(
                <span key={`match-${idx}`} className="bg-primary/30 text-primary font-semibold px-0.5 rounded">
                    {match.match}
                </span>
            );
            lastIndex = match.index + match.match.length;
        });

        if (lastIndex < testString.length) {
            parts.push(<span key="text-end">{testString.slice(lastIndex)}</span>);
        }

        return parts;
    };

    return (
        <ToolLayout
            title="Regex Tester"
            description="Test and debug regular expressions with real-time matching"
            category="developer"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Pattern Input */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <label className="block text-lg font-semibold text-text-primary mb-3">Regular Expression</label>
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-mono">/</span>
                            <input
                                type="text"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                placeholder="Enter your regex pattern..."
                                className="input pl-8 pr-4 font-mono"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-mono">/</span>
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="flex flex-wrap gap-3">
                        <span className="text-text-secondary font-medium">Flags:</span>
                        {Object.entries(flags).map(([flag, enabled]) => (
                            <label key={flag} className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={() => toggleFlag(flag as keyof typeof flags)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                />
                                <span className="text-text-primary font-mono">{flag}</span>
                            </label>
                        ))}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm font-mono">
                            {error}
                        </div>
                    )}
                </div>

                {/* Common Patterns */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Common Patterns</h3>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_PATTERNS.map((p) => (
                            <button
                                key={p.name}
                                onClick={() => loadPattern(p)}
                                className="px-3 py-1.5 bg-bg-tertiary border border-border rounded hover:border-primary hover:bg-primary/10 transition-colors text-sm text-text-primary"
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Test String */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <label className="block text-lg font-semibold text-text-primary mb-3">Test String</label>
                    <textarea
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        placeholder="Enter text to test your regex against..."
                        rows={6}
                        className="w-full p-4 bg-bg-tertiary border-2 border-border rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-mono text-sm"
                    />
                </div>

                {/* Results */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-text-primary">
                            Matches {matches.length > 0 && <span className="text-primary">({matches.length})</span>}
                        </h3>
                    </div>

                    {testString && (
                        <div className="mb-6 p-4 bg-bg-tertiary rounded-lg border border-border">
                            <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
                                {highlightMatches()}
                            </div>
                        </div>
                    )}

                    {matches.length > 0 && (
                        <div className="space-y-3">
                            {matches.map((match, idx) => (
                                <div key={idx} className="p-4 bg-bg-tertiary rounded border border-border">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-sm font-semibold text-text-secondary">Match {idx + 1}</span>
                                        <span className="text-xs text-text-tertiary">Index: {match.index}</span>
                                    </div>
                                    <div className="font-mono text-primary mb-2">{match.match}</div>
                                    {match.groups.length > 0 && (
                                        <div className="text-sm">
                                            <span className="text-text-secondary">Capture Groups: </span>
                                            <span className="text-text-primary font-mono">{match.groups.join(', ')}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!testString && (
                        <p className="text-text-tertiary text-center py-8 italic">Enter a test string to see matches</p>
                    )}

                    {testString && matches.length === 0 && !error && (
                        <p className="text-text-tertiary text-center py-8 italic">No matches found</p>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}
