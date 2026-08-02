'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, ShieldCheck, ShieldX, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolMetric, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type JsonRecord = Record<string, unknown>;

interface ValidationIssue {
    path: string;
    message: string;
}

const sampleSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "name", "tags"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "name": { "type": "string", "minLength": 2 },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}`;

const sampleJson = `{
  "id": 12,
  "name": "FreeWebTools",
  "tags": ["developer", "schema"]
}`;

function isRecord(value: unknown): value is JsonRecord {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function schemaTypes(schema: JsonRecord) {
    const type = schema.type;
    if (Array.isArray(type)) return type.filter((item): item is string => typeof item === 'string');
    return typeof type === 'string' ? [type] : [];
}

function valueMatchesType(value: unknown, type: string) {
    if (type === 'array') return Array.isArray(value);
    if (type === 'object') return isRecord(value);
    if (type === 'integer') return Number.isInteger(value);
    if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
    if (type === 'null') return value === null;
    return typeof value === type;
}

function describeValue(value: unknown) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (Number.isInteger(value)) return 'integer';
    return typeof value;
}

function validateValue(value: unknown, schema: unknown, path = '$'): ValidationIssue[] {
    if (!isRecord(schema)) return [];
    const issues: ValidationIssue[] = [];
    const types = schemaTypes(schema);

    if (types.length > 0 && !types.some((type) => valueMatchesType(value, type))) {
        issues.push({ path, message: `Expected ${types.join(' or ')}, received ${describeValue(value)}.` });
        return issues;
    }

    if ('const' in schema && JSON.stringify(value) !== JSON.stringify(schema.const)) {
        issues.push({ path, message: 'Value does not match const.' });
    }

    if (Array.isArray(schema.enum) && !schema.enum.some((item) => JSON.stringify(item) === JSON.stringify(value))) {
        issues.push({ path, message: 'Value is not one of the allowed enum values.' });
    }

    if (typeof value === 'number') {
        if (typeof schema.minimum === 'number' && value < schema.minimum) issues.push({ path, message: `Must be at least ${schema.minimum}.` });
        if (typeof schema.maximum === 'number' && value > schema.maximum) issues.push({ path, message: `Must be at most ${schema.maximum}.` });
        if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum) issues.push({ path, message: `Must be greater than ${schema.exclusiveMinimum}.` });
        if (typeof schema.exclusiveMaximum === 'number' && value >= schema.exclusiveMaximum) issues.push({ path, message: `Must be less than ${schema.exclusiveMaximum}.` });
    }

    if (typeof value === 'string') {
        if (typeof schema.minLength === 'number' && value.length < schema.minLength) issues.push({ path, message: `Must be at least ${schema.minLength} characters.` });
        if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) issues.push({ path, message: `Must be at most ${schema.maxLength} characters.` });
        if (typeof schema.pattern === 'string') {
            try {
                if (!new RegExp(schema.pattern).test(value)) issues.push({ path, message: `Must match pattern ${schema.pattern}.` });
            } catch {
                issues.push({ path, message: `Schema pattern is invalid: ${schema.pattern}.` });
            }
        }
    }

    if (Array.isArray(value)) {
        if (typeof schema.minItems === 'number' && value.length < schema.minItems) issues.push({ path, message: `Must contain at least ${schema.minItems} items.` });
        if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) issues.push({ path, message: `Must contain at most ${schema.maxItems} items.` });
        if (schema.items) {
            value.forEach((item, index) => {
                issues.push(...validateValue(item, schema.items, `${path}[${index}]`));
            });
        }
    }

    if (isRecord(value)) {
        const properties = isRecord(schema.properties) ? schema.properties : {};
        const required = Array.isArray(schema.required) ? schema.required.filter((item): item is string => typeof item === 'string') : [];

        required.forEach((key) => {
            if (!(key in value)) issues.push({ path, message: `Missing required property "${key}".` });
        });

        Object.entries(value).forEach(([key, childValue]) => {
            const childPath = `${path}.${key}`;
            if (properties[key]) {
                issues.push(...validateValue(childValue, properties[key], childPath));
            } else if (schema.additionalProperties === false) {
                issues.push({ path: childPath, message: 'Additional property is not allowed.' });
            }
        });
    }

    return issues;
}

export default function JsonSchemaValidator() {
    const [schemaInput, setSchemaInput] = useToolState('json-schema-validator', 'schemaInput', sampleSchema);
    const [jsonInput, setJsonInput] = useToolState('json-schema-validator', 'jsonInput', sampleJson);
    const [copied, setCopied] = useState(false);

    const result = useMemo(() => {
        try {
            const schema = JSON.parse(schemaInput);
            const data = JSON.parse(jsonInput);
            const issues = validateValue(data, schema);
            return {
                issues,
                error: '',
                valid: issues.length === 0,
                report: issues.length === 0
                    ? 'Valid: JSON data matches the schema.'
                    : issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'),
            };
        } catch (error) {
            return {
                issues: [],
                error: error instanceof Error ? error.message : 'Invalid JSON input.',
                valid: false,
                report: '',
            };
        }
    }, [jsonInput, schemaInput]);

    const copyReport = async () => {
        if (!result.report) return;
        await navigator.clipboard.writeText(result.report);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setSchemaInput('');
        setJsonInput('');
        setCopied(false);
    };

    const loadSample = () => {
        setSchemaInput(sampleSchema);
        setJsonInput(sampleJson);
        setCopied(false);
    };

    return (
        <ToolLayout
            title="JSON Schema Validator"
            description="Validate JSON data against common JSON Schema rules"
            category="developer"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    <ToolPanel title="JSON Schema">
                        <ToolTextarea
                            value={schemaInput}
                            onChange={(event) => {
                                setSchemaInput(event.target.value);
                                setCopied(false);
                            }}
                            placeholder='{"type":"object"}'
                            className="min-h-[420px]"
                            spellCheck={false}
                        />
                    </ToolPanel>

                    <ToolPanel title="JSON data">
                        <ToolTextarea
                            value={jsonInput}
                            onChange={(event) => {
                                setJsonInput(event.target.value);
                                setCopied(false);
                            }}
                            placeholder='{"name":"FreeWebTools"}'
                            className="min-h-[420px]"
                            spellCheck={false}
                        />
                    </ToolPanel>
                </div>

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

                {result.error ? (
                    <ToolStatus tone="error">{result.error}</ToolStatus>
                ) : result.valid ? (
                    <ToolStatus tone="success">JSON data matches the schema.</ToolStatus>
                ) : (
                    <ToolStatus tone="warning">JSON data has {result.issues.length} schema issue{result.issues.length === 1 ? '' : 's'}.</ToolStatus>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Result" value={result.valid && !result.error ? 'Valid' : 'Check'} />
                    <ToolMetric label="Issues" value={result.issues.length} />
                    <ToolMetric label="Rules" value="Common" />
                </div>

                <ToolPanel
                    title="Validation report"
                    actions={
                        <button type="button" onClick={copyReport} disabled={!result.report} className="btn btn-secondary h-8 gap-2 px-3">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy report'}
                        </button>
                    }
                >
                    {result.error ? (
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Fix the JSON input to run validation.
                        </div>
                    ) : result.issues.length === 0 ? (
                        <div className="flex items-center gap-3 rounded-md border bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="font-medium">No schema issues found.</span>
                        </div>
                    ) : (
                        <div className="divide-y rounded-md border">
                            {result.issues.map((issue, index) => (
                                <div key={`${issue.path}-${index}`} className="grid gap-2 p-4 md:grid-cols-[180px_1fr]">
                                    <div className="flex items-center gap-2 font-mono text-sm text-foreground">
                                        <ShieldX className="h-4 w-4 text-destructive" />
                                        {issue.path}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{issue.message}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
