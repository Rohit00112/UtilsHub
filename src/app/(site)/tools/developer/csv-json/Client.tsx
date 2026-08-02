'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, Repeat2, Table2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type Mode = 'csv-to-json' | 'json-to-csv';
type Delimiter = 'comma' | 'semicolon' | 'tab';

const modeOptions: Array<{ label: string; value: Mode }> = [
    { label: 'CSV to JSON', value: 'csv-to-json' },
    { label: 'JSON to CSV', value: 'json-to-csv' },
];

const delimiterOptions: Array<{ label: string; value: Delimiter }> = [
    { label: 'Comma', value: 'comma' },
    { label: 'Semicolon', value: 'semicolon' },
    { label: 'Tab', value: 'tab' },
];

const delimiterMap: Record<Delimiter, string> = {
    comma: ',',
    semicolon: ';',
    tab: '\t',
};

interface ConversionMeta {
    rows: number;
    columns: number;
    shape: string;
}

function parseCsv(input: string, delimiter: string) {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < input.length; i += 1) {
        const character = input[i];

        if (inQuotes) {
            if (character === '"') {
                if (input[i + 1] === '"') {
                    field += '"';
                    i += 1;
                } else {
                    inQuotes = false;
                }
            } else {
                field += character;
            }
            continue;
        }

        if (character === '"') {
            inQuotes = true;
        } else if (character === delimiter) {
            row.push(field);
            field = '';
        } else if (character === '\n' || character === '\r') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
            if (character === '\r' && input[i + 1] === '\n') i += 1;
        } else {
            field += character;
        }
    }

    if (inQuotes) {
        throw new Error('CSV has an unterminated quoted field.');
    }

    row.push(field);
    rows.push(row);

    return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

function csvToJson(input: string, delimiter: string, hasHeader: boolean, pretty: boolean) {
    const rows = parseCsv(input, delimiter);
    if (rows.length === 0) throw new Error('Paste at least one CSV row.');

    const columns = Math.max(...rows.map((row) => row.length));

    if (!hasHeader) {
        return {
            output: JSON.stringify(rows, null, pretty ? 2 : 0),
            meta: { rows: rows.length, columns, shape: 'Array rows' },
        };
    }

    const headers = rows[0].map((header, index) => header.trim() || `column_${index + 1}`);
    const data = rows.slice(1).map((cells) => {
        return headers.reduce<Record<string, string>>((record, header, index) => {
            record[header] = cells[index] ?? '';
            return record;
        }, {});
    });

    return {
        output: JSON.stringify(data, null, pretty ? 2 : 0),
        meta: { rows: data.length, columns: headers.length, shape: 'Objects from header row' },
    };
}

function normalizeJsonValue(value: unknown): string {
    if (value === null || typeof value === 'undefined') return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function csvCell(value: unknown, delimiter: string) {
    const text = normalizeJsonValue(value);
    if (text.includes(delimiter) || /["\r\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

function jsonToCsv(input: string, delimiter: string) {
    const value = JSON.parse(input) as unknown;
    let rows: unknown[][];
    let shape = 'Rows';

    if (Array.isArray(value)) {
        if (value.every((item) => Array.isArray(item))) {
            rows = value as unknown[][];
            shape = 'Array rows';
        } else if (value.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
            const records = value as Array<Record<string, unknown>>;
            const headers = Array.from(new Set(records.flatMap((record) => Object.keys(record))));
            rows = [headers, ...records.map((record) => headers.map((header) => record[header]))];
            shape = 'Objects with headers';
        } else {
            rows = value.map((item) => [item]);
            shape = 'Single-value rows';
        }
    } else if (value && typeof value === 'object') {
        rows = Object.entries(value as Record<string, unknown>);
        shape = 'Key/value rows';
    } else {
        rows = [[value]];
        shape = 'Single value';
    }

    const columns = rows.reduce((max, current) => Math.max(max, current.length), 0);
    const output = rows.map((row) => row.map((cell) => csvCell(cell, delimiter)).join(delimiter)).join('\n');

    return {
        output,
        meta: { rows: rows.length, columns, shape },
    };
}

const sampleCsv = 'name,email,role\nAda Lovelace,ada@example.com,Engineer\nGrace Hopper,grace@example.com,Admiral';
const sampleJson = '[\n  {\n    "name": "Ada Lovelace",\n    "email": "ada@example.com",\n    "role": "Engineer"\n  }\n]';

export default function CsvJsonConverter() {
    const [mode, setMode] = useToolState<Mode>('csv-json', 'mode', 'csv-to-json');
    const [delimiter, setDelimiter] = useToolState<Delimiter>('csv-json', 'delimiter', 'comma');
    const [input, setInput] = useToolState('csv-json', 'input', sampleCsv);
    const [output, setOutput] = useToolState('csv-json', 'output', '');
    const [error, setError] = useState('');
    const [hasHeader, setHasHeader] = useToolState('csv-json', 'hasHeader', true);
    const [prettyJson, setPrettyJson] = useToolState('csv-json', 'prettyJson', true);
    const [copied, setCopied] = useState(false);
    const [meta, setMeta] = useToolState<ConversionMeta | null>('csv-json', 'meta', null);

    const delimiterLabel = useMemo(() => delimiterOptions.find((option) => option.value === delimiter)?.label || 'Comma', [delimiter]);

    const convert = () => {
        setError('');
        setCopied(false);

        try {
            const result = mode === 'csv-to-json'
                ? csvToJson(input, delimiterMap[delimiter], hasHeader, prettyJson)
                : jsonToCsv(input, delimiterMap[delimiter]);
            setOutput(result.output);
            setMeta(result.meta);
        } catch (conversionError) {
            setOutput('');
            setMeta(null);
            setError(conversionError instanceof Error ? conversionError.message : 'Unable to convert this input.');
        }
    };

    const copyOutput = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setError('Clipboard access was blocked by the browser.');
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setError('');
        setMeta(null);
        setCopied(false);
    };

    const switchMode = (nextMode: Mode) => {
        setMode(nextMode);
        setInput(nextMode === 'csv-to-json' ? sampleCsv : sampleJson);
        setOutput('');
        setError('');
        setMeta(null);
        setCopied(false);
    };

    const swapOutputToInput = () => {
        setInput(output);
        setOutput('');
        setMeta(null);
        setError('');
        setCopied(false);
        setMode(mode === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json');
    };

    return (
        <ToolLayout title="CSV to JSON Converter" description="Convert CSV rows to JSON, or export JSON back to CSV" category="developer">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel
                    title="Conversion settings"
                    description={`Using ${delimiterLabel.toLowerCase()} as the delimiter.`}
                    actions={<ToolSegmentedControl value={mode} options={modeOptions} onChange={switchMode} />}
                >
                    <div className="flex flex-wrap gap-4">
                        <ToolField label="Delimiter">
                            <ToolSegmentedControl value={delimiter} options={delimiterOptions} onChange={setDelimiter} />
                        </ToolField>
                        {mode === 'csv-to-json' && (
                            <label className="inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={hasHeader}
                                    onChange={(event) => setHasHeader(event.target.checked)}
                                    className="h-4 w-4 accent-current"
                                />
                                First row is header
                            </label>
                        )}
                        {mode === 'csv-to-json' && (
                            <label className="inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={prettyJson}
                                    onChange={(event) => setPrettyJson(event.target.checked)}
                                    className="h-4 w-4 accent-current"
                                />
                                Pretty JSON
                            </label>
                        )}
                    </div>
                </ToolPanel>

                <div className="grid gap-6 lg:grid-cols-2">
                    <ToolPanel title={mode === 'csv-to-json' ? 'CSV input' : 'JSON input'}>
                        <ToolTextarea
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder={mode === 'csv-to-json' ? 'Paste CSV data...' : 'Paste JSON data...'}
                            className="min-h-96"
                        />
                    </ToolPanel>

                    <ToolPanel
                        title={mode === 'csv-to-json' ? 'JSON output' : 'CSV output'}
                        actions={output && (
                            <button type="button" onClick={copyOutput} className="btn btn-secondary gap-2">
                                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        )}
                    >
                        <ToolTextarea value={output} readOnly placeholder="Converted output will appear here..." className="min-h-96" />
                    </ToolPanel>
                </div>

                <ToolActionBar>
                    <button type="button" onClick={convert} className="btn btn-primary gap-2">
                        <Table2 className="h-4 w-4" />
                        Convert
                    </button>
                    <button type="button" onClick={swapOutputToInput} disabled={!output} className="btn btn-secondary gap-2">
                        <Repeat2 className="h-4 w-4" />
                        Use output as input
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                {meta && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <ToolMetric label="Rows" value={meta.rows} />
                        <ToolMetric label="Columns" value={meta.columns} />
                        <ToolMetric label="Shape" value={<span className="text-base">{meta.shape}</span>} />
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
