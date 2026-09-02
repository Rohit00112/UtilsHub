'use client';

import { useCallback, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Clipboard, Eraser, Search } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolPanel,
    ToolStatus,
    ToolTextarea,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

/* ------------------------------------------------------------------ */
/*  JSONPath helpers                                                    */
/* ------------------------------------------------------------------ */

function buildPath(segments: (string | number)[]): string {
    let path = '$';
    for (const seg of segments) {
        if (typeof seg === 'number') {
            path += `[${seg}]`;
        } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(seg)) {
            path += `.${seg}`;
        } else {
            path += `["${seg.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;
        }
    }
    return path;
}

function typeLabel(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return `array[${value.length}]`;
    if (typeof value === 'object') return `object{${Object.keys(value as Record<string, unknown>).length}}`;
    return typeof value;
}

function typeColor(value: unknown): string {
    if (value === null) return 'text-orange-500 dark:text-orange-400';
    if (typeof value === 'string') return 'text-emerald-600 dark:text-emerald-400';
    if (typeof value === 'number') return 'text-blue-600 dark:text-blue-400';
    if (typeof value === 'boolean') return 'text-purple-600 dark:text-purple-400';
    return 'text-muted-foreground';
}

function valuePreview(value: unknown): string {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value.length > 60 ? value.slice(0, 57) + '...' : value}"`;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return '';
}

/* ------------------------------------------------------------------ */
/*  Tree node component                                                */
/* ------------------------------------------------------------------ */

function TreeNode({
    keyName,
    value,
    path,
    selectedPath,
    onSelect,
    searchTerm,
    depth,
    defaultOpen,
}: {
    keyName: string | number | null;
    value: unknown;
    path: (string | number)[];
    selectedPath: string;
    onSelect: (path: string) => void;
    searchTerm: string;
    depth: number;
    defaultOpen: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const jsonPath = buildPath(path);
    const isSelected = selectedPath === jsonPath;
    const isObject = value !== null && typeof value === 'object';
    const entries = isObject
        ? Array.isArray(value)
            ? value.map((v, i) => [i, v] as [number, unknown])
            : Object.entries(value as Record<string, unknown>)
        : [];

    const matchesSearch = searchTerm
        ? (keyName !== null && String(keyName).toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

    const hasMatchingDescendant = useMemo((): boolean => {
        if (!searchTerm) return true;
        if (matchesSearch) return true;
        if (!isObject) return false;
        const check = (val: unknown): boolean => {
            if (val === null || typeof val !== 'object') return false;
            const items = Array.isArray(val)
                ? val.map((v, i) => [i, v] as [number, unknown])
                : Object.entries(val as Record<string, unknown>);
            return items.some(([k, v]) => {
                const kStr = String(k).toLowerCase();
                if (kStr.includes(searchTerm.toLowerCase())) return true;
                return check(v);
            });
        };
        return check(value);
    }, [searchTerm, matchesSearch, isObject, value]);

    if (searchTerm && !matchesSearch && !hasMatchingDescendant) return null;

    const handleClick = () => onSelect(jsonPath);

    return (
        <div className={depth > 0 ? 'ml-4 border-l border-border/50 pl-2' : ''}>
            <div
                className={`group flex items-start gap-1 rounded-lg px-2 py-1 text-sm cursor-pointer transition-colors hover:bg-accent/50 ${isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}
                onClick={handleClick}
            >
                {/* Expand/collapse toggle */}
                {isObject && entries.length > 0 ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                        className="mt-0.5 flex-shrink-0 rounded p-0.5 hover:bg-accent"
                    >
                        {open
                            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                    </button>
                ) : (
                    <span className="mt-0.5 w-[18px] flex-shrink-0" />
                )}

                <div className="min-w-0 flex-1">
                    <span className="inline-flex flex-wrap items-baseline gap-1.5">
                        {/* Key */}
                        {keyName !== null && (
                            <span className="font-semibold text-foreground">
                                {typeof keyName === 'number' ? `[${keyName}]` : `${keyName}`}
                                <span className="text-muted-foreground">:</span>
                            </span>
                        )}
                        {/* Value or type badge */}
                        {isObject ? (
                            <span className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                                {typeLabel(value)}
                            </span>
                        ) : (
                            <span className={`font-mono ${typeColor(value)}`}>
                                {valuePreview(value)}
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {/* Children */}
            {isObject && open && entries.map(([k, v]) => (
                <TreeNode
                    key={String(k)}
                    keyName={k}
                    value={v}
                    path={[...path, k]}
                    selectedPath={selectedPath}
                    onSelect={onSelect}
                    searchTerm={searchTerm}
                    depth={depth + 1}
                    defaultOpen={depth < 1}
                />
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function JsonPathFinder() {
    const [input, setInput] = useToolState('json-path-finder', 'input', '');
    const [search, setSearch] = useToolState('json-path-finder', 'search', '');
    const [selectedPath, setSelectedPath] = useState('');
    const [copied, setCopied] = useState(false);

    const { parsed, error } = useMemo(() => {
        if (!input.trim()) return { parsed: undefined, error: '' };
        try {
            return { parsed: JSON.parse(input), error: '' };
        } catch {
            return { parsed: undefined, error: 'Invalid JSON. Check for syntax errors.' };
        }
    }, [input]);

    const handleSelect = useCallback((path: string) => {
        setSelectedPath(path);
        setCopied(false);
    }, []);

    const copyPath = async () => {
        if (!selectedPath) return;
        try {
            await navigator.clipboard.writeText(selectedPath);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            // Clipboard blocked
        }
    };

    const clearAll = () => {
        setInput('');
        setSearch('');
        setSelectedPath('');
        setCopied(false);
    };

    return (
        <ToolLayout title="JSON Path Finder" description="Paste JSON and click any value to get its JSONPath expression" category="developer">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* ── Input ──────────────────────────────── */}
                    <ToolPanel
                        title="Input JSON"
                        actions={
                            <button onClick={clearAll} className="btn btn-secondary h-8 gap-2 px-3">
                                <Eraser className="h-4 w-4" />Clear
                            </button>
                        }
                    >
                        <ToolTextarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='{"store":{"books":[{"title":"Example"}]}}'
                            className="min-h-[480px]"
                        />
                    </ToolPanel>

                    {/* ── Tree ───────────────────────────────── */}
                    <ToolPanel title="Interactive tree">
                        {/* Search bar */}
                        <div className="mb-4 flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
                            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search keys..."
                                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                            />
                        </div>

                        {/* Tree content */}
                        <div className="min-h-[400px] max-h-[500px] overflow-auto rounded-xl border bg-muted/10 p-3">
                            {error && <ToolStatus tone="error">{error}</ToolStatus>}
                            {!input.trim() && !error && (
                                <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                                    Paste JSON on the left to explore its structure.
                                </p>
                            )}
                            {parsed !== undefined && (
                                <TreeNode
                                    keyName={null}
                                    value={parsed}
                                    path={[]}
                                    selectedPath={selectedPath}
                                    onSelect={handleSelect}
                                    searchTerm={search}
                                    depth={0}
                                    defaultOpen={true}
                                />
                            )}
                        </div>
                    </ToolPanel>
                </div>

                {/* ── Selected path ──────────────────────────── */}
                <ToolPanel title="Selected JSONPath">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 rounded-xl border bg-muted/20 px-4 py-3 font-mono text-sm text-foreground">
                            {selectedPath || <span className="text-muted-foreground">Click a node in the tree to see its path.</span>}
                        </div>
                        <button
                            type="button"
                            onClick={copyPath}
                            disabled={!selectedPath}
                            className="btn btn-primary gap-2"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy path'}
                        </button>
                    </div>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
