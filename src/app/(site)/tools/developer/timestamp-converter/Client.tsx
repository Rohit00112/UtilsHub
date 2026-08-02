'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check, Clipboard, Clock, RotateCcw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type InputMode = 'auto' | 'seconds' | 'milliseconds' | 'iso';

interface ParsedDate {
    date: Date;
    detected: string;
}

const inputModes: Array<{ label: string; value: InputMode }> = [
    { label: 'Auto', value: 'auto' },
    { label: 'Seconds', value: 'seconds' },
    { label: 'Milliseconds', value: 'milliseconds' },
    { label: 'ISO', value: 'iso' },
];

const pad = (value: number) => String(value).padStart(2, '0');

function toDateTimeLocalValue(date: Date) {
    return [
        date.getFullYear(),
        '-',
        pad(date.getMonth() + 1),
        '-',
        pad(date.getDate()),
        'T',
        pad(date.getHours()),
        ':',
        pad(date.getMinutes()),
    ].join('');
}

function parseNumeric(value: string) {
    if (!/^-?\d+(\.\d+)?$/.test(value)) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function parseTimestamp(input: string, mode: InputMode): ParsedDate | null {
    const value = input.trim();
    if (!value) return null;

    if (mode === 'seconds' || mode === 'milliseconds') {
        const numeric = parseNumeric(value);
        if (numeric === null) return null;
        const millis = mode === 'seconds' ? numeric * 1000 : numeric;
        const date = new Date(millis);
        return Number.isNaN(date.getTime()) ? null : { date, detected: mode };
    }

    if (mode === 'iso') {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : { date, detected: 'ISO date' };
    }

    const numeric = parseNumeric(value);
    if (numeric !== null) {
        const detected = Math.abs(numeric) >= 1_000_000_000_000 ? 'milliseconds' : 'seconds';
        const date = new Date(detected === 'seconds' ? numeric * 1000 : numeric);
        return Number.isNaN(date.getTime()) ? null : { date, detected };
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : { date, detected: 'ISO date' };
}

function formatLocal(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'full',
        timeStyle: 'long',
    }).format(date);
}

function formatUtc(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'full',
        timeStyle: 'long',
        timeZone: 'UTC',
    }).format(date);
}

function formatOffset(date: Date) {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absolute = Math.abs(offsetMinutes);
    return `UTC${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
}

function formatRelative(date: Date, now: Date) {
    const diff = date.getTime() - now.getTime();
    const absoluteSeconds = Math.round(Math.abs(diff) / 1000);
    const units = [
        { label: 'day', seconds: 86_400 },
        { label: 'hour', seconds: 3_600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 },
    ];
    const unit = units.find((item) => absoluteSeconds >= item.seconds) || units[units.length - 1];
    const count = Math.max(0, Math.round(absoluteSeconds / unit.seconds));
    const label = `${count} ${unit.label}${count === 1 ? '' : 's'}`;
    if (absoluteSeconds < 2) return 'now';
    return diff > 0 ? `in ${label}` : `${label} ago`;
}

export default function TimestampConverter() {
    const [now, setNow] = useState(() => new Date());
    const [input, setInput] = useToolState('timestamp-converter', 'input', () => String(Math.floor(Date.now() / 1000)));
    const [mode, setMode] = useToolState<InputMode>('timestamp-converter', 'mode', 'auto');
    const [localDate, setLocalDate] = useToolState('timestamp-converter', 'localDate', () => toDateTimeLocalValue(new Date()));
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const parsed = useMemo(() => parseTimestamp(input, mode), [input, mode]);
    const selectedLocalDate = useMemo(() => {
        const date = new Date(localDate);
        return Number.isNaN(date.getTime()) ? null : date;
    }, [localDate]);

    const copyValue = async (id: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(id);
            window.setTimeout(() => setCopied(null), 1600);
        } catch {
            setCopied(null);
        }
    };

    const useCurrentTime = () => {
        const current = new Date();
        setNow(current);
        setInput(String(Math.floor(current.getTime() / 1000)));
        setMode('auto');
        setLocalDate(toDateTimeLocalValue(current));
    };

    const renderCopyButton = (id: string, value: string) => (
        <button
            type="button"
            onClick={() => copyValue(id, value)}
            className="btn btn-secondary h-8 gap-2 px-3"
        >
            {copied === id ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copied === id ? 'Copied' : 'Copy'}
        </button>
    );

    return (
        <ToolLayout title="Timestamp Converter" description="Convert Unix timestamps, ISO strings, and local dates" category="developer">
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel
                    title="Current time"
                    description="Live values from your browser clock."
                    actions={
                        <button type="button" onClick={useCurrentTime} className="btn btn-secondary gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Use now
                        </button>
                    }
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        <ToolMetric
                            label="Unix seconds"
                            value={Math.floor(now.getTime() / 1000)}
                            description={formatRelative(now, now)}
                        />
                        <ToolMetric
                            label="Unix milliseconds"
                            value={now.getTime()}
                            description={formatOffset(now)}
                        />
                        <ToolMetric
                            label="ISO 8601"
                            value={<span className="break-all text-base">{now.toISOString()}</span>}
                            description="UTC"
                        />
                    </div>
                </ToolPanel>

                <ToolPanel title="Convert timestamp" description="Paste Unix seconds, milliseconds, or an ISO date string.">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                        <ToolField label="Input" htmlFor="timestamp-input">
                            <input
                                id="timestamp-input"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="1717075200 or 2026-05-30T12:00:00Z"
                                className="input h-11 font-mono"
                            />
                        </ToolField>
                        <ToolSegmentedControl value={mode} options={inputModes} onChange={setMode} />
                    </div>

                    {!parsed ? (
                        <ToolStatus tone="error" className="mt-4">
                            Enter a valid Unix timestamp, millisecond timestamp, or ISO date.
                        </ToolStatus>
                    ) : (
                        <div className="mt-5 space-y-4">
                            <ToolStatus tone="success">
                                Detected {parsed.detected}. Relative to now: {formatRelative(parsed.date, now)}.
                            </ToolStatus>
                            <div className="grid gap-4 md:grid-cols-2">
                                <ResultRow
                                    label="Local date"
                                    value={formatLocal(parsed.date)}
                                    action={renderCopyButton('local-date', formatLocal(parsed.date))}
                                />
                                <ResultRow
                                    label="UTC date"
                                    value={formatUtc(parsed.date)}
                                    action={renderCopyButton('utc-date', formatUtc(parsed.date))}
                                />
                                <ResultRow
                                    label="ISO 8601"
                                    value={parsed.date.toISOString()}
                                    action={renderCopyButton('iso-date', parsed.date.toISOString())}
                                />
                                <ResultRow
                                    label="Unix seconds"
                                    value={String(Math.floor(parsed.date.getTime() / 1000))}
                                    action={renderCopyButton('unix-seconds', String(Math.floor(parsed.date.getTime() / 1000)))}
                                />
                                <ResultRow
                                    label="Unix milliseconds"
                                    value={String(parsed.date.getTime())}
                                    action={renderCopyButton('unix-millis', String(parsed.date.getTime()))}
                                />
                                <ResultRow
                                    label="Timezone offset"
                                    value={formatOffset(parsed.date)}
                                    action={renderCopyButton('timezone-offset', formatOffset(parsed.date))}
                                />
                            </div>
                        </div>
                    )}
                </ToolPanel>

                <ToolPanel title="Create timestamp" description="Pick a local date and convert it to portable timestamp formats.">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                        <ToolField label="Local date and time" htmlFor="local-date-input">
                            <input
                                id="local-date-input"
                                type="datetime-local"
                                value={localDate}
                                onChange={(event) => setLocalDate(event.target.value)}
                                className="input h-11"
                            />
                        </ToolField>
                        <button
                            type="button"
                            onClick={() => selectedLocalDate && setInput(String(Math.floor(selectedLocalDate.getTime() / 1000)))}
                            disabled={!selectedLocalDate}
                            className="btn btn-primary h-11 gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            Use as input
                        </button>
                    </div>

                    {selectedLocalDate && (
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <ResultRow
                                label="Unix seconds"
                                value={String(Math.floor(selectedLocalDate.getTime() / 1000))}
                                action={renderCopyButton('created-seconds', String(Math.floor(selectedLocalDate.getTime() / 1000)))}
                            />
                            <ResultRow
                                label="Unix milliseconds"
                                value={String(selectedLocalDate.getTime())}
                                action={renderCopyButton('created-millis', String(selectedLocalDate.getTime()))}
                            />
                            <ResultRow
                                label="ISO 8601"
                                value={selectedLocalDate.toISOString()}
                                action={renderCopyButton('created-iso', selectedLocalDate.toISOString())}
                            />
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}

function ResultRow({ label, value, action }: { label: string; value: string; action: ReactNode }) {
    return (
        <div className="rounded-md border bg-muted/20 p-4">
            <div className="flex min-h-20 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="mt-1 break-words font-mono text-sm text-foreground">{value}</div>
                </div>
                <div className="shrink-0">{action}</div>
            </div>
        </div>
    );
}
