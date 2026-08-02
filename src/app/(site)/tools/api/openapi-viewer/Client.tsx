'use client';

import { useMemo, useState } from 'react';
import yaml from 'js-yaml';
import { Check, Clipboard, Eraser, FileJson2, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolMetric, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

interface Endpoint {
    method: string;
    path: string;
    summary: string;
    operationId: string;
    tags: string[];
    parameterCount: number;
    responseCodes: string[];
    hasRequestBody: boolean;
}

interface ParsedSpec {
    title: string;
    version: string;
    openapi: string;
    servers: string[];
    endpoints: Endpoint[];
    schemas: number;
}

const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

const sampleSpec = `openapi: 3.0.3
info:
  title: FreeWebTools Demo API
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /users:
    get:
      tags: [Users]
      summary: List users
      operationId: listUsers
      responses:
        '200':
          description: Users returned
    post:
      tags: [Users]
      summary: Create user
      operationId: createUser
      requestBody:
        required: true
      responses:
        '201':
          description: User created
  /users/{id}:
    get:
      tags: [Users]
      summary: Get user by id
      parameters:
        - name: id
          in: path
          required: true
      responses:
        '200':
          description: User returned
components:
  schemas:
    User:
      type: object`;

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function stringArray(value: unknown) {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function parseSpec(input: string): ParsedSpec {
    const loaded = yaml.load(input);
    if (!isRecord(loaded)) throw new Error('The OpenAPI document must be a JSON or YAML object.');

    const info = isRecord(loaded.info) ? loaded.info : {};
    const paths = isRecord(loaded.paths) ? loaded.paths : {};
    const components = isRecord(loaded.components) ? loaded.components : {};
    const schemas = isRecord(components.schemas) ? Object.keys(components.schemas).length : 0;
    const servers = Array.isArray(loaded.servers)
        ? loaded.servers
            .map((server) => (isRecord(server) && typeof server.url === 'string' ? server.url : ''))
            .filter(Boolean)
        : [];

    const endpoints: Endpoint[] = [];

    Object.entries(paths).forEach(([path, pathItem]) => {
        if (!isRecord(pathItem)) return;
        methods.forEach((method) => {
            const operation = pathItem[method];
            if (!isRecord(operation)) return;
            const responses = isRecord(operation.responses) ? Object.keys(operation.responses) : [];
            const parameters = Array.isArray(operation.parameters) ? operation.parameters.length : 0;

            endpoints.push({
                method: method.toUpperCase(),
                path,
                summary: typeof operation.summary === 'string' ? operation.summary : '',
                operationId: typeof operation.operationId === 'string' ? operation.operationId : '',
                tags: stringArray(operation.tags),
                parameterCount: parameters,
                responseCodes: responses,
                hasRequestBody: Boolean(operation.requestBody),
            });
        });
    });

    return {
        title: typeof info.title === 'string' ? info.title : 'Untitled API',
        version: typeof info.version === 'string' ? info.version : 'unknown',
        openapi: typeof loaded.openapi === 'string' ? loaded.openapi : typeof loaded.swagger === 'string' ? loaded.swagger : 'unknown',
        servers,
        endpoints,
        schemas,
    };
}

function endpointSummary(endpoints: Endpoint[]) {
    return endpoints
        .map((endpoint) => `${endpoint.method.padEnd(7)} ${endpoint.path}${endpoint.summary ? ` - ${endpoint.summary}` : ''}`)
        .join('\n');
}

export default function OpenApiViewer() {
    const [input, setInput] = useToolState('openapi-viewer', 'input', sampleSpec);
    const [copied, setCopied] = useState(false);

    const result = useMemo(() => {
        try {
            if (!input.trim()) {
                return { spec: null, error: 'Paste an OpenAPI JSON or YAML document.' };
            }
            return { spec: parseSpec(input), error: '' };
        } catch (error) {
            return {
                spec: null,
                error: error instanceof Error ? error.message : 'Unable to parse this OpenAPI document.',
            };
        }
    }, [input]);

    const copySummary = async () => {
        if (!result.spec) return;
        await navigator.clipboard.writeText(endpointSummary(result.spec.endpoints));
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setInput('');
        setCopied(false);
    };

    const loadSample = () => {
        setInput(sampleSpec);
        setCopied(false);
    };

    return (
        <ToolLayout
            title="OpenAPI Viewer"
            description="Paste an OpenAPI or Swagger document and inspect endpoints, responses, and schemas"
            category="api"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="OpenAPI document" description="Supports JSON and YAML OpenAPI 3.x or Swagger 2.0 documents.">
                    <ToolTextarea
                        value={input}
                        onChange={(event) => {
                            setInput(event.target.value);
                            setCopied(false);
                        }}
                        placeholder="Paste OpenAPI YAML or JSON here."
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

                {result.spec ? (
                    <>
                        <ToolPanel
                            title={result.spec.title}
                            description={`Version ${result.spec.version} · OpenAPI ${result.spec.openapi}`}
                            actions={
                                <button type="button" onClick={copySummary} disabled={result.spec.endpoints.length === 0} className="btn btn-secondary h-8 gap-2 px-3">
                                    {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                    {copied ? 'Copied' : 'Copy endpoints'}
                                </button>
                            }
                        >
                            <div className="grid gap-4 sm:grid-cols-4">
                                <ToolMetric label="Endpoints" value={result.spec.endpoints.length} />
                                <ToolMetric label="Servers" value={result.spec.servers.length} />
                                <ToolMetric label="Schemas" value={result.spec.schemas} />
                                <ToolMetric label="Methods" value={new Set(result.spec.endpoints.map((endpoint) => endpoint.method)).size} />
                            </div>
                            {result.spec.servers.length > 0 && (
                                <div className="mt-4 rounded-md border bg-muted/20 p-4">
                                    <div className="text-sm font-medium text-foreground">Servers</div>
                                    <div className="mt-2 space-y-1 font-mono text-sm text-muted-foreground">
                                        {result.spec.servers.map((server) => <div key={server} className="break-all">{server}</div>)}
                                    </div>
                                </div>
                            )}
                        </ToolPanel>

                        <ToolPanel title="Endpoints">
                            {result.spec.endpoints.length === 0 ? (
                                <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                                    No operations were found under paths.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {result.spec.endpoints.map((endpoint) => (
                                        <div key={`${endpoint.method}-${endpoint.path}`} className="rounded-md border bg-muted/20 p-4">
                                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded bg-foreground px-2 py-1 font-mono text-xs font-semibold text-background">{endpoint.method}</span>
                                                        <span className="break-all font-mono text-sm text-foreground">{endpoint.path}</span>
                                                    </div>
                                                    <p className="mt-2 text-sm text-muted-foreground">{endpoint.summary || endpoint.operationId || 'No summary provided.'}</p>
                                                </div>
                                                {endpoint.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {endpoint.tags.map((tag) => (
                                                            <span key={tag} className="rounded border bg-background px-2 py-1 text-xs text-muted-foreground">{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <span className="rounded border bg-background px-2 py-1">{endpoint.parameterCount} params</span>
                                                <span className="rounded border bg-background px-2 py-1">{endpoint.hasRequestBody ? 'request body' : 'no body'}</span>
                                                <span className="rounded border bg-background px-2 py-1">responses: {endpoint.responseCodes.join(', ') || 'none'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ToolPanel>
                    </>
                ) : (
                    <ToolPanel title="Parsed API">
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            <FileJson2 className="mx-auto mb-3 h-8 w-8" />
                            Parsed API details will appear here.
                        </div>
                    </ToolPanel>
                )}
            </div>
        </ToolLayout>
    );
}
