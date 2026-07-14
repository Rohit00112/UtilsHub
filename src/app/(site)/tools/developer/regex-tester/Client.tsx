'use client';

import { useEffect, useState } from 'react';
import { SearchCode } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolEmptyState,
    ToolField,
    ToolPanel,
    ToolResultCard,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';

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
                .filter((entry) => entry[1])
                .map(([flag]) => flag)
                .join('');
            const regex = new RegExp(pattern, flagString);
            const foundMatches: Match[] = [];

            if (flags.g) {
                let match;
                while ((match = regex.exec(testString)) !== null) {
                    foundMatches.push({ match: match[0], index: match.index, groups: match.slice(1) });
                }
            } else {
                const match = regex.exec(testString);
                if (match) foundMatches.push({ match: match[0], index: match.index, groups: match.slice(1) });
            }

            setMatches(foundMatches);
            setError('');
        } catch (err) {
            setError((err as Error).message);
            setMatches([]);
        }
    }, [flags, pattern, testString]);

    const toggleFlag = (flag: keyof typeof flags) => {
        setFlags((current) => ({ ...current, [flag]: !current[flag] }));
    };

    const loadPattern = (commonPattern: typeof COMMON_PATTERNS[0]) => {
        setPattern(commonPattern.pattern);
        const newFlags = { g: false, i: false, m: false, s: false, u: false, y: false };
        commonPattern.flags.split('').forEach((flag) => {
            newFlags[flag as keyof typeof flags] = true;
        });
        setFlags(newFlags);
    };

    const highlightMatches = () => {
        if (matches.length === 0) return testString;

        const parts: JSX.Element[] = [];
        let lastIndex = 0;

        matches.forEach((match, index) => {
            if (match.index > lastIndex) {
                parts.push(<span key={`text-${index}`}>{testString.slice(lastIndex, match.index)}</span>);
            }
            parts.push(
                <span key={`match-${index}`} className="rounded bg-primary/15 px-0.5 font-semibold text-primary">
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
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Regular expression">
                    <ToolField label="Pattern">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">/</span>
                            <input
                                type="text"
                                value={pattern}
                                onChange={(event) => setPattern(event.target.value)}
                                placeholder="Enter your regex pattern"
                                className="input px-8 font-mono"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">/</span>
                        </div>
                    </ToolField>

                    <div className="mt-4 flex flex-wrap gap-3">
                        {Object.entries(flags).map(([flag, enabled]) => (
                            <label key={flag} className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={() => toggleFlag(flag as keyof typeof flags)}
                                    className="h-4 w-4 rounded border-border"
                                />
                                <span className="font-mono text-foreground">{flag}</span>
                            </label>
                        ))}
                    </div>

                    {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                </ToolPanel>

                <ToolPanel title="Common patterns">
                    <div className="flex flex-wrap gap-2">
                        {COMMON_PATTERNS.map((commonPattern) => (
                            <button
                                key={commonPattern.name}
                                onClick={() => loadPattern(commonPattern)}
                                className="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
                            >
                                {commonPattern.name}
                            </button>
                        ))}
                    </div>
                </ToolPanel>

                <ToolPanel title="Test string">
                    <ToolTextarea
                        value={testString}
                        onChange={(event) => setTestString(event.target.value)}
                        placeholder="Enter text to test your regex against"
                        rows={7}
                    />
                </ToolPanel>

                <ToolPanel title={`Matches${matches.length > 0 ? ` (${matches.length})` : ''}`}>
                    {testString ? (
                        <div className="mb-4 rounded-md border bg-muted/20 p-4">
                            <div className="whitespace-pre-wrap break-words font-mono text-sm leading-6">{highlightMatches()}</div>
                        </div>
                    ) : (
                        <ToolEmptyState
                            icon={<SearchCode className="h-8 w-8" />}
                            title="No test string"
                            description="Enter text above to see matches highlighted here."
                        />
                    )}

                    {matches.length > 0 && (
                        <div className="space-y-3">
                            {matches.map((match, index) => (
                                <ToolResultCard key={`${match.index}-${index}`} title={`Match ${index + 1}`} meta={`Index ${match.index}`}>
                                    <div className="font-mono text-sm text-foreground">{match.match}</div>
                                    {match.groups.length > 0 && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Capture groups: <span className="font-mono text-foreground">{match.groups.join(', ')}</span>
                                        </p>
                                    )}
                                </ToolResultCard>
                            ))}
                        </div>
                    )}

                    {testString && matches.length === 0 && !error && (
                        <ToolEmptyState title="No matches found" description="Adjust the pattern, flags, or test string." />
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
