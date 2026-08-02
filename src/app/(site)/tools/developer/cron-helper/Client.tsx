'use client';

import { useEffect, useMemo, useState } from 'react';
import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';
import { Check, Clipboard, Clock, Eraser, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolField, ToolMetric, ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const presets = [
    { label: 'Every 5 minutes', expression: '*/5 * * * *' },
    { label: 'Weekdays at 09:00', expression: '0 9 * * MON-FRI' },
    { label: 'Daily at midnight', expression: '@daily' },
    { label: 'First day monthly', expression: '0 0 1 * *' },
    { label: 'Weekend cleanup', expression: '30 2 * * SAT,SUN' },
];

const predefinedExpressions: Record<string, string> = {
    '@yearly': '0 0 0 1 1 *',
    '@annually': '0 0 0 1 1 *',
    '@monthly': '0 0 0 1 * *',
    '@weekly': '0 0 0 * * 0',
    '@daily': '0 0 0 * * *',
    '@hourly': '0 0 * * * *',
    '@minutely': '0 * * * * *',
    '@secondly': '* * * * * *',
    '@weekdays': '0 0 0 * * 1-5',
    '@weekends': '0 0 0 * * 0,6',
};

const fieldLabels = ['Second', 'Minute', 'Hour', 'Day of month', 'Month', 'Day of week'];

function toDatetimeLocal(date: Date) {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseCurrentDate(value: string) {
    if (!value) return new Date();
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error('Enter a valid starting date and time.');
    }
    return parsed;
}

function getFieldBreakdown(expression: string) {
    const normalized = expression.trim().toLowerCase();
    const expanded = predefinedExpressions[normalized] || expression.trim();
    const parts = expanded.split(/\s+/).filter(Boolean);

    if (parts.length === 5) {
        return ['0', ...parts].map((value, index) => ({
            label: fieldLabels[index],
            value,
            note: index === 0 ? 'implicit' : '',
        }));
    }

    if (parts.length === 6) {
        return parts.map((value, index) => ({
            label: fieldLabels[index],
            value,
            note: predefinedExpressions[normalized] ? 'preset' : '',
        }));
    }

    return [];
}

function formatRunDate(date: Date, timezone: string) {
    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'long',
            timeZone: timezone || undefined,
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
}

export default function CronHelper() {
    const [expression, setExpression] = useToolState('cron-helper', 'expression', '*/5 * * * *');
    const [timezone, setTimezone] = useToolState('cron-helper', 'timezone', 'UTC');
    const [currentDate, setCurrentDate] = useToolState('cron-helper', 'currentDate', () => toDatetimeLocal(new Date()));
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (browserTimezone) setTimezone(browserTimezone);
    }, [setTimezone]);

    const result = useMemo(() => {
        const trimmed = expression.trim();
        if (!trimmed) {
            return {
                description: '',
                runs: [],
                fields: [],
                error: 'Enter a cron expression.',
            };
        }

        try {
            const description = cronstrue.toString(trimmed, {
                verbose: true,
                use24HourTimeFormat: true,
            });
            const interval = CronExpressionParser.parse(trimmed, {
                currentDate: parseCurrentDate(currentDate),
                tz: timezone.trim() || undefined,
                strict: false,
            });
            const runs = interval.take(10).map((runDate) => {
                const date = runDate.toDate();
                return {
                    iso: runDate.toISOString() || date.toISOString(),
                    local: formatRunDate(date, timezone.trim()),
                };
            });

            return {
                description,
                runs,
                fields: getFieldBreakdown(trimmed),
                error: '',
            };
        } catch (error) {
            return {
                description: '',
                runs: [],
                fields: getFieldBreakdown(trimmed),
                error: error instanceof Error ? error.message : 'Unable to parse this cron expression.',
            };
        }
    }, [currentDate, expression, timezone]);

    const copyExpression = async () => {
        await navigator.clipboard.writeText(expression.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setExpression('');
        setCurrentDate(toDatetimeLocal(new Date()));
        setCopied(false);
    };

    const loadPreset = (value: string) => {
        setExpression(value);
        setCopied(false);
    };

    return (
        <ToolLayout
            title="Cron Expression Helper"
            description="Explain cron schedules, inspect fields, and preview upcoming run times"
            category="developer"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel
                    title="Schedule"
                    actions={
                        <button type="button" onClick={copyExpression} disabled={!expression.trim()} className="btn btn-secondary h-8 gap-2 px-3">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy expression'}
                        </button>
                    }
                >
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
                        <ToolField label="Cron expression" htmlFor="cron-expression">
                            <input
                                id="cron-expression"
                                value={expression}
                                onChange={(event) => {
                                    setExpression(event.target.value);
                                    setCopied(false);
                                }}
                                placeholder="*/5 * * * *"
                                className="input h-11 font-mono"
                                spellCheck={false}
                            />
                        </ToolField>
                        <ToolField label="Timezone" htmlFor="cron-timezone" description="IANA name, such as Asia/Kathmandu.">
                            <input
                                id="cron-timezone"
                                value={timezone}
                                onChange={(event) => setTimezone(event.target.value)}
                                placeholder="UTC"
                                className="input h-11 font-mono"
                                spellCheck={false}
                            />
                        </ToolField>
                        <ToolField label="Start from" htmlFor="cron-current-date">
                            <input
                                id="cron-current-date"
                                type="datetime-local"
                                value={currentDate}
                                onChange={(event) => setCurrentDate(event.target.value)}
                                className="input h-11 font-mono"
                            />
                        </ToolField>
                    </div>
                </ToolPanel>

                <ToolPanel title="Presets" description="Load a common schedule and adjust it as needed.">
                    <div className="flex flex-wrap gap-2">
                        {presets.map((preset) => (
                            <button
                                key={preset.expression}
                                type="button"
                                onClick={() => loadPreset(preset.expression)}
                                className="btn btn-secondary h-9 gap-2 px-3"
                            >
                                <Wand2 className="h-4 w-4" />
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </ToolPanel>

                {result.error ? (
                    <ToolStatus tone="error">{result.error}</ToolStatus>
                ) : (
                    <ToolStatus tone="success">{result.description}</ToolStatus>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <ToolMetric label="Expression fields" value={result.fields.length || '-'} />
                    <ToolMetric label="Previewed runs" value={result.runs.length} />
                    <ToolMetric
                        label="Timezone"
                        value={<span className="flex min-w-0 items-center gap-2 text-base"><Clock className="h-4 w-4 shrink-0" />{timezone || 'default'}</span>}
                    />
                </div>

                <ToolPanel title="Field breakdown">
                    {result.fields.length === 0 ? (
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Enter a 5-field, 6-field, or predefined cron expression to see each field.
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {result.fields.map((field) => (
                                <div key={field.label} className="rounded-md border bg-muted/20 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{field.label}</div>
                                        {field.note && <span className="rounded border bg-background px-2 py-0.5 text-xs text-muted-foreground">{field.note}</span>}
                                    </div>
                                    <div className="mt-2 break-all font-mono text-sm text-foreground">{field.value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>

                <ToolPanel title="Next 10 run times" description="Dates are generated by cron-parser using the selected start time and timezone.">
                    {result.runs.length === 0 ? (
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Valid upcoming run times will appear here.
                        </div>
                    ) : (
                        <div className="divide-y rounded-md border">
                            {result.runs.map((run, index) => (
                                <div key={`${run.iso}-${index}`} className="grid gap-2 p-4 md:grid-cols-[80px_1fr_1fr] md:items-center">
                                    <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                                    <div className="font-mono text-sm text-foreground">{run.local}</div>
                                    <div className="break-all font-mono text-xs text-muted-foreground">{run.iso}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>

                <ToolActionBar className="justify-center">
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>
            </div>
        </ToolLayout>
    );
}
