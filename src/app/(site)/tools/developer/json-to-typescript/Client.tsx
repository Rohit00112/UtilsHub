'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, FileCode2, Wand2 } from 'lucide-react';
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

type DeclarationKind = 'interface' | 'type';

type TypeNode =
    | { kind: 'primitive'; name: 'string' | 'number' | 'boolean' | 'null' | 'unknown' }
    | { kind: 'array'; items: TypeNode }
    | { kind: 'object'; properties: Array<{ name: string; optional: boolean; type: TypeNode }> }
    | { kind: 'union'; types: TypeNode[] };

const sampleJson = `{
  "id": 42,
  "name": "FreeWebTools",
  "publishedAt": null,
  "owner": {
    "email": "team@example.com",
    "roles": ["admin", "editor"]
  },
  "features": [
    {
      "name": "JSON tools",
      "enabled": true,
      "tags": ["developer", "local"]
    },
    {
      "name": "PDF tools",
      "enabled": true
    }
  ]
}`;

function inferType(value: unknown): TypeNode {
    if (value === null) return { kind: 'primitive', name: 'null' };
    if (Array.isArray(value)) {
        return {
            kind: 'array',
            items: value.length > 0 ? mergeTypes(value.map(inferType)) : { kind: 'primitive', name: 'unknown' },
        };
    }
    if (typeof value === 'object') {
        const objectValue = value as Record<string, unknown>;
        return {
            kind: 'object',
            properties: Object.keys(objectValue).map((key) => ({
                name: key,
                optional: false,
                type: inferType(objectValue[key]),
            })),
        };
    }
    if (typeof value === 'number') return { kind: 'primitive', name: 'number' };
    if (typeof value === 'boolean') return { kind: 'primitive', name: 'boolean' };
    if (typeof value === 'string') return { kind: 'primitive', name: 'string' };
    return { kind: 'primitive', name: 'unknown' };
}

function mergeTypes(nodes: TypeNode[]): TypeNode {
    if (nodes.length === 0) return { kind: 'primitive', name: 'unknown' };

    const flattened = nodes.flatMap((node) => (node.kind === 'union' ? node.types : [node]));

    if (flattened.every((node) => node.kind === 'object')) {
        return mergeObjects(flattened as Array<Extract<TypeNode, { kind: 'object' }>>);
    }

    if (flattened.every((node) => node.kind === 'array')) {
        return {
            kind: 'array',
            items: mergeTypes((flattened as Array<Extract<TypeNode, { kind: 'array' }>>).map((node) => node.items)),
        };
    }

    const unique = new Map<string, TypeNode>();
    flattened.forEach((node) => unique.set(typeSignature(node), node));
    const types = Array.from(unique.values()).sort((a, b) => typeSignature(a).localeCompare(typeSignature(b)));

    return types.length === 1 ? types[0] : { kind: 'union', types };
}

function mergeObjects(objects: Array<Extract<TypeNode, { kind: 'object' }>>): TypeNode {
    const names = Array.from(new Set(objects.flatMap((object) => object.properties.map((property) => property.name))));

    return {
        kind: 'object',
        properties: names.map((name) => {
            const present = objects
                .map((object) => object.properties.find((property) => property.name === name))
                .filter((property): property is { name: string; optional: boolean; type: TypeNode } => Boolean(property));

            return {
                name,
                optional: present.length < objects.length || present.some((property) => property.optional),
                type: mergeTypes(present.map((property) => property.type)),
            };
        }),
    };
}

function typeSignature(node: TypeNode): string {
    if (node.kind === 'primitive') return `primitive:${node.name}`;
    if (node.kind === 'array') return `array:${typeSignature(node.items)}`;
    if (node.kind === 'union') return `union:${node.types.map(typeSignature).sort().join('|')}`;
    return `object:${node.properties
        .map((property) => `${property.name}${property.optional ? '?' : ''}:${typeSignature(property.type)}`)
        .sort()
        .join(',')}`;
}

function toPascalCase(value: string, fallback: string) {
    const words = value
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean);
    const name = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    const safeName = name || fallback;
    return /^[0-9]/.test(safeName) ? `T${safeName}` : safeName;
}

function singularize(value: string) {
    if (value.endsWith('ies')) return `${value.slice(0, -3)}y`;
    if (value.endsWith('s') && value.length > 1) return value.slice(0, -1);
    return value;
}

function formatPropertyName(name: string) {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
}

function wrapArrayItem(typeName: string) {
    return typeName.includes(' | ') ? `(${typeName})` : typeName;
}

function countProperties(node: TypeNode): number {
    if (node.kind === 'object') {
        return node.properties.reduce((total, property) => total + 1 + countProperties(property.type), 0);
    }
    if (node.kind === 'array') return countProperties(node.items);
    if (node.kind === 'union') return node.types.reduce((total, type) => total + countProperties(type), 0);
    return 0;
}

function countOptionalProperties(node: TypeNode): number {
    if (node.kind === 'object') {
        return node.properties.reduce(
            (total, property) => total + (property.optional ? 1 : 0) + countOptionalProperties(property.type),
            0
        );
    }
    if (node.kind === 'array') return countOptionalProperties(node.items);
    if (node.kind === 'union') return node.types.reduce((total, type) => total + countOptionalProperties(type), 0);
    return 0;
}

function labelKind(node: TypeNode): string {
    if (node.kind === 'primitive') return node.name;
    if (node.kind === 'array') return 'array';
    if (node.kind === 'object') return 'object';
    return 'union';
}

function generateTypeScript(rootNode: TypeNode, rootName: string, declarationKind: DeclarationKind, exported: boolean) {
    const declarations: string[] = [];
    const emitted = new Set<string>();
    const exportPrefix = exported ? 'export ' : '';

    const renderType = (node: TypeNode, nameHint: string): string => {
        if (node.kind === 'primitive') return node.name;

        if (node.kind === 'array') {
            const safeName = toPascalCase(nameHint, 'GeneratedType');
            const singularName = toPascalCase(singularize(nameHint), `${safeName}Item`);
            const itemName = singularName === safeName ? `${safeName}Item` : singularName;
            return `${wrapArrayItem(renderType(node.items, itemName))}[]`;
        }

        if (node.kind === 'union') {
            return node.types.map((type, index) => renderType(type, `${nameHint}${index + 1}`)).join(' | ');
        }

        const typeName = toPascalCase(nameHint, 'GeneratedType');

        if (!emitted.has(typeName)) {
            emitted.add(typeName);
            const index = declarations.length;
            declarations.push('');

            const body = node.properties.length
                ? node.properties
                    .map((property) => {
                        const propertyType = renderType(property.type, `${typeName}${toPascalCase(property.name, 'Property')}`);
                        return `  ${formatPropertyName(property.name)}${property.optional ? '?' : ''}: ${propertyType};`;
                    })
                    .join('\n')
                : '  [key: string]: unknown;';

            declarations[index] = declarationKind === 'interface'
                ? `${exportPrefix}interface ${typeName} {\n${body}\n}`
                : `${exportPrefix}type ${typeName} = {\n${body}\n};`;
        }

        return typeName;
    };

    const safeRootName = toPascalCase(rootName, 'GeneratedType');
    const rootType = renderType(rootNode, safeRootName);

    if (rootNode.kind !== 'object') {
        declarations.unshift(`${exportPrefix}type ${safeRootName} = ${rootType};`);
    }

    return declarations.join('\n\n');
}

export default function JsonToTypescript() {
    const [input, setInput] = useToolState('json-to-typescript', 'input', sampleJson);
    const [rootName, setRootName] = useToolState('json-to-typescript', 'rootName', 'FreeWebToolsTool');
    const [declarationKind, setDeclarationKind] = useToolState<DeclarationKind>('json-to-typescript', 'declarationKind', 'interface');
    const [exported, setExported] = useToolState('json-to-typescript', 'exported', true);
    const [copied, setCopied] = useState(false);

    const result = useMemo(() => {
        try {
            const parsed = JSON.parse(input);
            const rootNode = inferType(parsed);
            const output = generateTypeScript(rootNode, rootName, declarationKind, exported);
            return {
                output,
                error: '',
                rootKind: labelKind(rootNode),
                propertyCount: countProperties(rootNode),
                optionalCount: countOptionalProperties(rootNode),
                declarationCount: (output.match(/\b(?:interface|type)\s+[A-Za-z_$][A-Za-z0-9_$]*/g) || []).length,
            };
        } catch (error) {
            return {
                output: '',
                error: error instanceof Error ? error.message : 'Invalid JSON input.',
                rootKind: '-',
                propertyCount: 0,
                optionalCount: 0,
                declarationCount: 0,
            };
        }
    }, [declarationKind, exported, input, rootName]);

    const copyTypes = async () => {
        if (!result.output) return;
        await navigator.clipboard.writeText(result.output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setInput('');
        setRootName('GeneratedType');
        setCopied(false);
    };

    const loadSample = () => {
        setInput(sampleJson);
        setRootName('FreeWebToolsTool');
        setDeclarationKind('interface');
        setExported(true);
        setCopied(false);
    };

    return (
        <ToolLayout
            title="JSON to TypeScript"
            description="Infer TypeScript interfaces or type aliases from sample JSON"
            category="developer"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel
                    title="JSON sample"
                    description="Paste a representative payload. Arrays are merged so missing object fields become optional."
                >
                    <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
                        <ToolField label="Root type name" htmlFor="ts-root-name">
                            <input
                                id="ts-root-name"
                                value={rootName}
                                onChange={(event) => {
                                    setRootName(event.target.value);
                                    setCopied(false);
                                }}
                                placeholder="GeneratedType"
                                className="input h-10"
                            />
                        </ToolField>
                        <ToolField label="Declaration style">
                            <ToolSegmentedControl
                                value={declarationKind}
                                onChange={(value) => {
                                    setDeclarationKind(value);
                                    setCopied(false);
                                }}
                                options={[
                                    { label: 'Interface', value: 'interface' },
                                    { label: 'Type', value: 'type' },
                                ]}
                            />
                        </ToolField>
                        <label className="inline-flex h-10 items-center gap-2 rounded-md border bg-muted/30 px-3 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={exported}
                                onChange={(event) => {
                                    setExported(event.target.checked);
                                    setCopied(false);
                                }}
                                className="h-4 w-4 accent-current"
                            />
                            Export
                        </label>
                    </div>

                    <ToolTextarea
                        value={input}
                        onChange={(event) => {
                            setInput(event.target.value);
                            setCopied(false);
                        }}
                        placeholder='{"name":"FreeWebTools"}'
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

                <div className="grid gap-4 sm:grid-cols-4">
                    <ToolMetric label="Root kind" value={result.rootKind} />
                    <ToolMetric label="Properties" value={result.propertyCount} />
                    <ToolMetric label="Optional keys" value={result.optionalCount} />
                    <ToolMetric label="Declarations" value={result.declarationCount} />
                </div>

                <ToolPanel
                    title="Generated TypeScript"
                    actions={
                        <button
                            type="button"
                            onClick={copyTypes}
                            disabled={!result.output}
                            className="btn btn-secondary h-8 gap-2 px-3"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy types'}
                        </button>
                    }
                >
                    {result.output ? (
                        <pre className="min-h-[420px] overflow-x-auto whitespace-pre-wrap rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                            {result.output}
                        </pre>
                    ) : (
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            <FileCode2 className="mx-auto mb-3 h-8 w-8" />
                            TypeScript output will appear here.
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
