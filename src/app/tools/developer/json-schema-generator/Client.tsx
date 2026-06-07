'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, FileJson2, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolMetric, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';

type JsonSchema = {
    $schema?: string;
    title?: string;
    type?: string | string[];
    properties?: Record<string, JsonSchema>;
    required?: string[];
    items?: JsonSchema;
    additionalProperties?: boolean;
    examples?: unknown[];
};

const sampleJson = `{
  "id": 42,
  "name": "UtilsHub",
  "active": true,
  "tags": ["tools", "developer"],
  "owner": {
    "email": "team@example.com",
    "verified": true
  }
}`;

function getJsonType(value: unknown) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

function mergeTypes(types: Array<string | string[] | undefined>) {
    const merged = Array.from(new Set(types.flatMap((type) => Array.isArray(type) ? type : type ? [type] : [])));
    if (merged.length === 0) return undefined;
    return merged.length === 1 ? merged[0] : merged.sort();
}

function mergeSchemas(schemas: JsonSchema[]): JsonSchema {
    const type = mergeTypes(schemas.map((schema) => schema.type));
    const output: JsonSchema = {};
    if (type) output.type = type;

    if (schemas.some((schema) => schema.properties)) {
        const properties: Record<string, JsonSchema[]> = {};
        schemas.forEach((schema) => {
            Object.entries(schema.properties || {}).forEach(([key, value]) => {
                properties[key] = [...(properties[key] || []), value];
            });
        });
        output.properties = Object.fromEntries(
            Object.entries(properties).map(([key, values]) => [key, mergeSchemas(values)])
        );
        output.additionalProperties = false;
    }

    const itemSchemas = schemas.map((schema) => schema.items).filter((schema): schema is JsonSchema => Boolean(schema));
    if (itemSchemas.length > 0) output.items = mergeSchemas(itemSchemas);

    return output;
}

function inferSchema(value: unknown): JsonSchema {
    const type = getJsonType(value);

    if (type === 'array') {
        const items = value as unknown[];
        return {
            type: 'array',
            items: items.length > 0 ? mergeSchemas(items.map(inferSchema)) : {},
        };
    }

    if (type === 'object') {
        const objectValue = value as Record<string, unknown>;
        const keys = Object.keys(objectValue);
        return {
            type: 'object',
            properties: Object.fromEntries(keys.map((key) => [key, inferSchema(objectValue[key])])),
            required: keys,
            additionalProperties: false,
        };
    }

    if (type === 'number') {
        return { type: Number.isInteger(value) ? 'integer' : 'number' };
    }

    return { type };
}

function countProperties(schema: JsonSchema): number {
    return Object.values(schema.properties || {}).reduce((total, child) => total + 1 + countProperties(child), 0)
        + (schema.items ? countProperties(schema.items) : 0);
}

export default function JsonSchemaGenerator() {
    const [input, setInput] = useState(sampleJson);
    const [title, setTitle] = useState('GeneratedSchema');
    const [includeExample, setIncludeExample] = useState(true);
    const [copied, setCopied] = useState(false);

    const result = useMemo(() => {
        try {
            const parsed = JSON.parse(input);
            const schema = inferSchema(parsed);
            schema.$schema = 'https://json-schema.org/draft/2020-12/schema';
            if (title.trim()) schema.title = title.trim();
            if (includeExample) schema.examples = [parsed];
            return {
                schema,
                output: JSON.stringify(schema, null, 2),
                error: '',
                propertyCount: countProperties(schema),
            };
        } catch (error) {
            return {
                schema: null,
                output: '',
                error: error instanceof Error ? error.message : 'Invalid JSON input.',
                propertyCount: 0,
            };
        }
    }, [includeExample, input, title]);

    const copySchema = async () => {
        if (!result.output) return;
        await navigator.clipboard.writeText(result.output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setInput('');
        setTitle('');
        setCopied(false);
    };

    const loadSample = () => {
        setInput(sampleJson);
        setTitle('GeneratedSchema');
        setIncludeExample(true);
        setCopied(false);
    };

    return (
        <ToolLayout
            title="JSON Schema Generator"
            description="Infer a JSON Schema draft from sample JSON data"
            category="developer"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Sample JSON" description="Paste the shape you want to describe. The generator infers types and required object keys.">
                    <div className="mb-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                        <div>
                            <label htmlFor="schema-title" className="mb-2 block text-sm font-medium text-muted-foreground">Schema title</label>
                            <input
                                id="schema-title"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="GeneratedSchema"
                                className="input h-10"
                            />
                        </div>
                        <label className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={includeExample}
                                onChange={(event) => setIncludeExample(event.target.checked)}
                                className="h-4 w-4 accent-current"
                            />
                            Include example
                        </label>
                    </div>
                    <ToolTextarea
                        value={input}
                        onChange={(event) => {
                            setInput(event.target.value);
                            setCopied(false);
                        }}
                        placeholder='{"name":"UtilsHub"}'
                        className="min-h-[360px]"
                        spellCheck={false}
                    />
                </ToolPanel>

                <ToolActionBar className="justify-center">
                    <button type="button" onClick={loadSample} className="btn btn-secondary gap-2">
                        <Wand2 className="h-4 w-4" />
                        Sample
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                {result.error && <ToolStatus tone="error">{result.error}</ToolStatus>}

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Schema type" value={result.schema?.type || '-'} />
                    <ToolMetric label="Properties" value={result.propertyCount} />
                    <ToolMetric label="Draft" value="2020-12" />
                </div>

                <ToolPanel
                    title="Generated schema"
                    actions={
                        <button type="button" onClick={copySchema} disabled={!result.output} className="btn btn-secondary h-8 gap-2 px-3">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy schema'}
                        </button>
                    }
                >
                    {result.output ? (
                        <pre className="min-h-[420px] overflow-x-auto whitespace-pre-wrap rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                            {result.output}
                        </pre>
                    ) : (
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            <FileJson2 className="mx-auto mb-3 h-8 w-8" />
                            A generated schema will appear here.
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
