'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, Minimize2, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolField, ToolMetric, ToolPanel, ToolSegmentedControl, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type Mode = 'format' | 'minify';
type KeywordCase = 'upper' | 'lower';

const sampleSql = `select u.id,u.email,count(o.id) as orders_total
from users u
left join orders o on o.user_id = u.id
where u.active = true and o.created_at >= '2026-01-01'
group by u.id,u.email
order by orders_total desc;`;

const majorKeywords = new Set([
    'select',
    'from',
    'where',
    'group by',
    'order by',
    'having',
    'limit',
    'offset',
    'insert into',
    'values',
    'update',
    'set',
    'delete from',
    'returning',
]);

const newlineBefore = [
    'left join',
    'right join',
    'inner join',
    'outer join',
    'full join',
    'cross join',
    'join',
    'on',
    'and',
    'or',
    'union all',
    'union',
];

function applyKeywordCase(value: string, keywordCase: KeywordCase) {
    const keywords = [
        ...Array.from(majorKeywords),
        ...newlineBefore,
        'as',
        'case',
        'when',
        'then',
        'else',
        'end',
        'distinct',
        'null',
        'true',
        'false',
    ].sort((a, b) => b.length - a.length);

    return keywords.reduce((text, keyword) => {
        const replacement = keywordCase === 'upper' ? keyword.toUpperCase() : keyword.toLowerCase();
        return text.replace(new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'gi'), replacement);
    }, value);
}

function normalizeSpacing(sql: string) {
    return sql
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s*;\s*/g, ';')
        .trim();
}

function formatSql(sql: string, keywordCase: KeywordCase, indentSize: number) {
    const indent = ' '.repeat(indentSize);
    let output = normalizeSpacing(sql);

    Array.from(majorKeywords)
        .sort((a, b) => b.length - a.length)
        .forEach((keyword) => {
            output = output.replace(new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'gi'), `\n${keyword}`);
        });

    newlineBefore
        .sort((a, b) => b.length - a.length)
        .forEach((keyword) => {
            output = output.replace(new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'gi'), `\n${indent}${keyword}`);
        });

    output = output
        .replace(/\s*,\s*/g, `,\n${indent}`)
        .replace(/\(\s*/g, '(')
        .replace(/\s*\)/g, ')')
        .replace(/^\s+/, '')
        .replace(/\n{2,}/g, '\n')
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');

    return applyKeywordCase(output, keywordCase);
}

function minifySql(sql: string, keywordCase: KeywordCase) {
    return applyKeywordCase(normalizeSpacing(sql), keywordCase);
}

export default function SqlFormatter() {
    const [input, setInput] = useToolState('sql-formatter', 'input', sampleSql);
    const [mode, setMode] = useToolState<Mode>('sql-formatter', 'mode', 'format');
    const [keywordCase, setKeywordCase] = useToolState<KeywordCase>('sql-formatter', 'keywordCase', 'upper');
    const [indentSize, setIndentSize] = useToolState('sql-formatter', 'indentSize', '2');
    const [copied, setCopied] = useState(false);

    const output = useMemo(() => {
        const indent = Number(indentSize);
        const safeIndent = Number.isInteger(indent) && indent >= 2 && indent <= 8 ? indent : 2;
        return mode === 'minify'
            ? minifySql(input, keywordCase)
            : formatSql(input, keywordCase, safeIndent);
    }, [indentSize, input, keywordCase, mode]);

    const copyOutput = async () => {
        if (!output) return;
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setInput('');
        setCopied(false);
    };

    const loadSample = () => {
        setInput(sampleSql);
        setCopied(false);
    };

    return (
        <ToolLayout
            title="SQL Formatter"
            description="Format or minify SQL queries with readable keyword casing and indentation"
            category="developer"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    <ToolPanel title="Input SQL">
                        <ToolTextarea
                            value={input}
                            onChange={(event) => {
                                setInput(event.target.value);
                                setCopied(false);
                            }}
                            placeholder="select * from users where active = true;"
                            className="min-h-[420px]"
                            spellCheck={false}
                        />
                    </ToolPanel>

                    <ToolPanel
                        title="Output"
                        actions={
                            <button type="button" onClick={copyOutput} disabled={!output} className="btn btn-secondary h-8 gap-2 px-3">
                                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        }
                    >
                        <ToolTextarea
                            value={output}
                            readOnly
                            placeholder="Formatted SQL will appear here."
                            className="min-h-[420px]"
                            spellCheck={false}
                        />
                    </ToolPanel>
                </div>

                <ToolPanel title="Options">
                    <div className="grid gap-4 md:grid-cols-[auto_auto_160px] md:items-end">
                        <ToolField label="Mode">
                            <ToolSegmentedControl
                                value={mode}
                                onChange={setMode}
                                options={[
                                    { label: 'Format', value: 'format' },
                                    { label: 'Minify', value: 'minify' },
                                ]}
                            />
                        </ToolField>
                        <ToolField label="Keyword case">
                            <ToolSegmentedControl
                                value={keywordCase}
                                onChange={setKeywordCase}
                                options={[
                                    { label: 'UPPER', value: 'upper' },
                                    { label: 'lower', value: 'lower' },
                                ]}
                            />
                        </ToolField>
                        <ToolField label="Indent" htmlFor="indent-size">
                            <input
                                id="indent-size"
                                type="number"
                                min="2"
                                max="8"
                                value={indentSize}
                                onChange={(event) => setIndentSize(event.target.value)}
                                className="input h-10"
                            />
                        </ToolField>
                    </div>
                </ToolPanel>

                <ToolActionBar className="justify-center">
                    <button type="button" onClick={loadSample} className="btn btn-secondary gap-2">
                        <Wand2 className="h-4 w-4" />
                        Sample
                    </button>
                    <button type="button" onClick={() => setMode('minify')} className="btn btn-secondary gap-2">
                        <Minimize2 className="h-4 w-4" />
                        Minify
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Input length" value={input.length} />
                    <ToolMetric label="Output length" value={output.length} />
                    <ToolMetric label="Lines" value={output ? output.split('\n').length : 0} />
                </div>
            </div>
        </ToolLayout>
    );
}
