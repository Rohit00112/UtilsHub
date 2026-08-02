'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clipboard, Eraser, Repeat2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type Mode = 'encode' | 'decode';
type EntityStyle = 'named' | 'numeric';

interface EntityReference {
    label: string;
    character: string;
    entity: string;
    display: string;
}

const modeOptions: Array<{ label: string; value: Mode }> = [
    { label: 'Encode', value: 'encode' },
    { label: 'Decode', value: 'decode' },
];

const entityStyleOptions: Array<{ label: string; value: EntityStyle }> = [
    { label: 'Named', value: 'named' },
    { label: 'Numeric', value: 'numeric' },
];

const entityMap: Record<string, Record<EntityStyle, string>> = {
    '&': { named: '&amp;', numeric: '&#38;' },
    '<': { named: '&lt;', numeric: '&#60;' },
    '>': { named: '&gt;', numeric: '&#62;' },
    '"': { named: '&quot;', numeric: '&#34;' },
    "'": { named: '&apos;', numeric: '&#39;' },
};

const commonReferences: EntityReference[] = [
    { label: 'Ampersand', character: '&', entity: '&amp;', display: '&' },
    { label: 'Less than', character: '<', entity: '&lt;', display: '<' },
    { label: 'Greater than', character: '>', entity: '&gt;', display: '>' },
    { label: 'Double quote', character: '"', entity: '&quot;', display: '"' },
    { label: 'Apostrophe', character: "'", entity: '&apos;', display: "'" },
    { label: 'Non-breaking space', character: '\u00a0', entity: '&nbsp;', display: 'NBSP' },
    { label: 'Copyright', character: '\u00a9', entity: '&copy;', display: '(c)' },
    { label: 'Registered', character: '\u00ae', entity: '&reg;', display: '(r)' },
];

const entityPattern = /&(?:[a-zA-Z][a-zA-Z0-9]+|#\d+|#x[\da-fA-F]+);/g;

function encodeHtml(
    value: string,
    {
        encodeQuotes,
        preserveEntities,
        style,
    }: {
        encodeQuotes: boolean;
        preserveEntities: boolean;
        style: EntityStyle;
    }
) {
    const protectedEntities: string[] = [];
    const source = preserveEntities
        ? value.replace(entityPattern, (match) => {
            protectedEntities.push(match);
            return `\uE000${protectedEntities.length - 1}\uE001`;
        })
        : value;

    const pattern = encodeQuotes ? /[&<>"']/g : /[&<>]/g;
    const encoded = source.replace(pattern, (character) => entityMap[character][style]);

    return protectedEntities.reduce(
        (result, entity, index) => result.replace(`\uE000${index}\uE001`, entity),
        encoded
    );
}

function decodeHtml(value: string) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
}

export default function HtmlEntities() {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [mode, setMode] = useToolState<Mode>('html-entities', 'mode', 'encode');
    const [entityStyle, setEntityStyle] = useToolState<EntityStyle>('html-entities', 'entityStyle', 'named');
    const [encodeQuotes, setEncodeQuotes] = useToolState('html-entities', 'encodeQuotes', true);
    const [preserveEntities, setPreserveEntities] = useToolState('html-entities', 'preserveEntities', false);
    const [input, setInput] = useToolState('html-entities', 'input', '');
    const [copied, setCopied] = useState(false);

    const { output, error } = useMemo(() => {
        if (!input) {
            return { output: '', error: '' };
        }
        try {
            return {
                output: mode === 'encode'
                    ? encodeHtml(input, { encodeQuotes, preserveEntities, style: entityStyle })
                    : decodeHtml(input),
                error: '',
            };
        } catch {
            return { output: '', error: 'Unable to decode this input. Check that the entities are well formed.' };
        }
    }, [encodeQuotes, entityStyle, input, mode, preserveEntities]);

    const entityMatches = useMemo(() => input.match(entityPattern) ?? [], [input]);
    const encodedCharacterCount = useMemo(() => {
        const pattern = encodeQuotes ? /[&<>"']/g : /[&<>]/g;
        return input.match(pattern)?.length ?? 0;
    }, [encodeQuotes, input]);
    const changedCount = mode === 'encode' ? encodedCharacterCount : entityMatches.length;
    const outputDelta = output.length - input.length;

    useEffect(() => {
        setCopied(false);
    }, [output]);

    const copyOutput = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    const clearAll = () => {
        setInput('');
        setCopied(false);
    };

    const swapValues = () => {
        setInput(output);
        setMode(mode === 'encode' ? 'decode' : 'encode');
        setCopied(false);
    };

    const insertReference = (reference: EntityReference) => {
        const insertion = mode === 'encode' ? reference.character : reference.entity;
        const textarea = inputRef.current;

        if (!textarea) {
            setInput((current) => current + insertion);
            return;
        }

        const start = textarea.selectionStart ?? input.length;
        const end = textarea.selectionEnd ?? input.length;
        const nextValue = `${input.slice(0, start)}${insertion}${input.slice(end)}`;
        const cursorPosition = start + insertion.length;

        setInput(nextValue);
        window.requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(cursorPosition, cursorPosition);
        });
    };

    return (
        <ToolLayout title="HTML Entity Encoder" description="Encode reserved HTML characters or decode entities back to text" category="text">
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel
                    title="Conversion setup"
                    actions={<ToolSegmentedControl value={mode} options={modeOptions} onChange={setMode} />}
                >
                    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                        <div className="rounded-md border bg-muted/20 p-4">
                            <div className="font-mono text-sm text-muted-foreground">&lt;span&gt;5 &gt; 3&lt;/span&gt;</div>
                            <div className="mt-2 break-words font-mono text-sm text-foreground">&amp;lt;span&amp;gt;5 &amp;gt; 3&amp;lt;/span&amp;gt;</div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-1">
                                <p className="text-xs font-medium uppercase text-muted-foreground">Style</p>
                                <ToolSegmentedControl value={entityStyle} options={entityStyleOptions} onChange={setEntityStyle} />
                            </div>
                            <label className="flex min-h-20 items-start gap-3 rounded-md border bg-muted/20 p-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={encodeQuotes}
                                    disabled={mode === 'decode'}
                                    onChange={(event) => setEncodeQuotes(event.target.checked)}
                                    className="mt-1"
                                />
                                <span>
                                    <span className="block font-medium text-foreground">Quotes</span>
                                    <span className="text-muted-foreground">Encode &quot; and &apos;</span>
                                </span>
                            </label>
                            <label className="flex min-h-20 items-start gap-3 rounded-md border bg-muted/20 p-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={preserveEntities}
                                    disabled={mode === 'decode'}
                                    onChange={(event) => setPreserveEntities(event.target.checked)}
                                    className="mt-1"
                                />
                                <span>
                                    <span className="block font-medium text-foreground">Preserve</span>
                                    <span className="text-muted-foreground">Keep existing entities</span>
                                </span>
                            </label>
                        </div>
                    </div>
                </ToolPanel>

                <ToolPanel title={mode === 'encode' ? 'Text to encode' : 'Entities to decode'}>
                    <ToolTextarea
                        ref={inputRef}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder={mode === 'encode' ? '<strong>Encode this snippet</strong>' : '&lt;strong&gt;Decode this snippet&lt;/strong&gt;'}
                        className="min-h-64"
                    />
                </ToolPanel>

                <ToolActionBar>
                    <button type="button" onClick={swapValues} disabled={!input && !output} className="btn btn-secondary gap-2">
                        <Repeat2 className="h-4 w-4" />
                        Swap
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                    <button type="button" onClick={copyOutput} disabled={!output} className="btn btn-primary gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy result'}
                    </button>
                </ToolActionBar>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ToolMetric label="Input" value={input.length} description="characters" />
                    <ToolMetric label={mode === 'encode' ? 'Reserved' : 'Entities'} value={changedCount} description={mode === 'encode' ? 'characters matched' : 'references found'} />
                    <ToolMetric label="Output" value={output.length} description="characters" />
                    <ToolMetric label="Delta" value={outputDelta > 0 ? `+${outputDelta}` : outputDelta} description="character change" />
                </div>

                <ToolPanel title="Common references">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {commonReferences.map((reference) => (
                            <button
                                key={reference.entity}
                                type="button"
                                onClick={() => insertReference(reference)}
                                title={`Insert ${reference.label}`}
                                className="rounded-md border bg-muted/20 px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <span className="block text-sm font-medium text-foreground">{reference.display}</span>
                                <span className="mt-1 block break-all font-mono text-xs text-muted-foreground">{reference.entity}</span>
                            </button>
                        ))}
                    </div>
                </ToolPanel>

                <ToolPanel
                    title={mode === 'encode' ? 'Encoded output' : 'Decoded output'}
                    actions={output && (
                        <button type="button" onClick={copyOutput} className="btn btn-secondary gap-2">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    )}
                >
                    <ToolTextarea
                        value={output}
                        readOnly
                        placeholder="Result will appear here..."
                        className="min-h-64"
                    />
                    {output && (
                        <div className="mt-4 rounded-md border bg-muted/20 p-4">
                            <div className="text-xs font-medium uppercase text-muted-foreground">Preview</div>
                            <div className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">{output}</div>
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
