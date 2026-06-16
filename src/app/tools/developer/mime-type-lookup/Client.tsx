'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, FileSearch, Search } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolIconButton,
    ToolMetric,
    ToolPanel,
    ToolResultCard,
    ToolSegmentedControl,
    ToolStatus,
} from '@/components/tools/ToolPrimitives';

type LookupMode = 'all' | 'extension' | 'mime';

interface MimeRecord {
    extension: string;
    type: string;
    category: string;
    description: string;
}

const lookupOptions: Array<{ label: string; value: LookupMode }> = [
    { label: 'Search', value: 'all' },
    { label: 'Extension', value: 'extension' },
    { label: 'MIME type', value: 'mime' },
];

const mimeTypes: MimeRecord[] = [
    { extension: 'html', type: 'text/html', category: 'Text', description: 'HTML document' },
    { extension: 'css', type: 'text/css', category: 'Text', description: 'Cascading Style Sheet' },
    { extension: 'js', type: 'text/javascript', category: 'Text', description: 'JavaScript source' },
    { extension: 'mjs', type: 'text/javascript', category: 'Text', description: 'JavaScript module' },
    { extension: 'json', type: 'application/json', category: 'Text', description: 'JSON data' },
    { extension: 'xml', type: 'application/xml', category: 'Text', description: 'XML document' },
    { extension: 'txt', type: 'text/plain', category: 'Text', description: 'Plain text' },
    { extension: 'csv', type: 'text/csv', category: 'Text', description: 'Comma-separated values' },
    { extension: 'md', type: 'text/markdown', category: 'Text', description: 'Markdown document' },
    { extension: 'yaml', type: 'application/yaml', category: 'Text', description: 'YAML document' },
    { extension: 'yml', type: 'application/yaml', category: 'Text', description: 'YAML document' },
    { extension: 'pdf', type: 'application/pdf', category: 'Document', description: 'Portable Document Format' },
    { extension: 'rtf', type: 'application/rtf', category: 'Document', description: 'Rich Text Format' },
    { extension: 'doc', type: 'application/msword', category: 'Document', description: 'Microsoft Word document' },
    { extension: 'docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'Document', description: 'Microsoft Word Open XML document' },
    { extension: 'xls', type: 'application/vnd.ms-excel', category: 'Document', description: 'Microsoft Excel spreadsheet' },
    { extension: 'xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'Document', description: 'Microsoft Excel Open XML spreadsheet' },
    { extension: 'ppt', type: 'application/vnd.ms-powerpoint', category: 'Document', description: 'Microsoft PowerPoint presentation' },
    { extension: 'pptx', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'Document', description: 'Microsoft PowerPoint Open XML presentation' },
    { extension: 'png', type: 'image/png', category: 'Image', description: 'Portable Network Graphics image' },
    { extension: 'jpg', type: 'image/jpeg', category: 'Image', description: 'JPEG image' },
    { extension: 'jpeg', type: 'image/jpeg', category: 'Image', description: 'JPEG image' },
    { extension: 'gif', type: 'image/gif', category: 'Image', description: 'Graphics Interchange Format image' },
    { extension: 'webp', type: 'image/webp', category: 'Image', description: 'WebP image' },
    { extension: 'svg', type: 'image/svg+xml', category: 'Image', description: 'Scalable Vector Graphics image' },
    { extension: 'avif', type: 'image/avif', category: 'Image', description: 'AVIF image' },
    { extension: 'ico', type: 'image/vnd.microsoft.icon', category: 'Image', description: 'Icon file' },
    { extension: 'bmp', type: 'image/bmp', category: 'Image', description: 'Bitmap image' },
    { extension: 'mp3', type: 'audio/mpeg', category: 'Audio', description: 'MP3 audio' },
    { extension: 'wav', type: 'audio/wav', category: 'Audio', description: 'Waveform audio' },
    { extension: 'ogg', type: 'audio/ogg', category: 'Audio', description: 'Ogg audio' },
    { extension: 'm4a', type: 'audio/mp4', category: 'Audio', description: 'MPEG-4 audio' },
    { extension: 'flac', type: 'audio/flac', category: 'Audio', description: 'FLAC audio' },
    { extension: 'mp4', type: 'video/mp4', category: 'Video', description: 'MP4 video' },
    { extension: 'webm', type: 'video/webm', category: 'Video', description: 'WebM video' },
    { extension: 'mov', type: 'video/quicktime', category: 'Video', description: 'QuickTime video' },
    { extension: 'avi', type: 'video/x-msvideo', category: 'Video', description: 'AVI video' },
    { extension: 'zip', type: 'application/zip', category: 'Archive', description: 'ZIP archive' },
    { extension: 'gz', type: 'application/gzip', category: 'Archive', description: 'Gzip archive' },
    { extension: 'tar', type: 'application/x-tar', category: 'Archive', description: 'Tape archive' },
    { extension: 'rar', type: 'application/vnd.rar', category: 'Archive', description: 'RAR archive' },
    { extension: '7z', type: 'application/x-7z-compressed', category: 'Archive', description: '7-Zip archive' },
    { extension: 'wasm', type: 'application/wasm', category: 'Developer', description: 'WebAssembly module' },
    { extension: 'ts', type: 'application/typescript', category: 'Developer', description: 'TypeScript source' },
    { extension: 'tsx', type: 'application/typescript', category: 'Developer', description: 'TypeScript JSX source' },
    { extension: 'jsx', type: 'text/jsx', category: 'Developer', description: 'JavaScript JSX source' },
    { extension: 'sql', type: 'application/sql', category: 'Developer', description: 'SQL source' },
    { extension: 'sh', type: 'application/x-sh', category: 'Developer', description: 'Shell script' },
    { extension: 'woff', type: 'font/woff', category: 'Font', description: 'Web Open Font Format' },
    { extension: 'woff2', type: 'font/woff2', category: 'Font', description: 'Web Open Font Format 2' },
    { extension: 'ttf', type: 'font/ttf', category: 'Font', description: 'TrueType font' },
    { extension: 'otf', type: 'font/otf', category: 'Font', description: 'OpenType font' },
    { extension: 'eot', type: 'application/vnd.ms-fontobject', category: 'Font', description: 'Embedded OpenType font' },
];

const categories = ['All', ...Array.from(new Set(mimeTypes.map((record) => record.category)))];

function normalizeExtension(value: string) {
    return value.trim().replace(/^\.+/, '').toLocaleLowerCase();
}

function normalizeQuery(value: string) {
    return value.trim().toLocaleLowerCase();
}

export default function MimeTypeLookup() {
    const [query, setQuery] = useState('json');
    const [mode, setMode] = useState<LookupMode>('all');
    const [category, setCategory] = useState('All');
    const [copiedKey, setCopiedKey] = useState('');

    const results = useMemo(() => {
        const normalized = normalizeQuery(query);
        const extensionQuery = normalizeExtension(query);

        return mimeTypes
            .filter((record) => category === 'All' || record.category === category)
            .filter((record) => {
                if (!normalized) return true;
                if (mode === 'extension') return record.extension === extensionQuery || record.extension.includes(extensionQuery);
                if (mode === 'mime') return record.type.toLocaleLowerCase().includes(normalized);

                return [
                    record.extension,
                    record.type,
                    record.category,
                    record.description,
                ].some((value) => value.toLocaleLowerCase().includes(normalized));
            })
            .sort((a, b) => a.extension.localeCompare(b.extension));
    }, [category, mode, query]);

    const exactMatches = useMemo(() => {
        const extensionQuery = normalizeExtension(query);
        const mimeQuery = normalizeQuery(query);
        return results.filter((record) => record.extension === extensionQuery || record.type.toLocaleLowerCase() === mimeQuery);
    }, [query, results]);

    const copyValue = async (value: string, key: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey(''), 1600);
    };

    const clearAll = () => {
        setQuery('');
        setCopiedKey('');
        setCategory('All');
        setMode('all');
    };

    return (
        <ToolLayout title="MIME Type Lookup" description="Find content types by file extension, MIME type, or format name" category="developer">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Lookup" actions={<ToolSegmentedControl value={mode} options={lookupOptions} onChange={setMode} />}>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
                        <ToolField label={mode === 'extension' ? 'File extension' : mode === 'mime' ? 'MIME type' : 'Search'}>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder={mode === 'extension' ? 'json, .png, pdf...' : mode === 'mime' ? 'application/json...' : 'json, image, spreadsheet...'}
                                    className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                        </ToolField>
                        <ToolField label="Category">
                            <select
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                {categories.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </ToolField>
                    </div>
                </ToolPanel>

                {exactMatches.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {exactMatches.slice(0, 2).map((record) => (
                            <ToolResultCard
                                key={`${record.extension}-${record.type}`}
                                title={`.${record.extension}`}
                                meta={record.description}
                                actions={
                                    <button
                                        type="button"
                                        onClick={() => copyValue(record.type, `${record.extension}-featured`)}
                                        className="btn btn-secondary gap-2"
                                    >
                                        {copiedKey === `${record.extension}-featured` ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                        {copiedKey === `${record.extension}-featured` ? 'Copied' : 'Copy'}
                                    </button>
                                }
                            >
                                <code className="block overflow-x-auto rounded-md bg-background px-3 py-2 text-sm text-foreground">{record.type}</code>
                            </ToolResultCard>
                        ))}
                    </div>
                )}

                <ToolPanel
                    title="Matches"
                    actions={
                        <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                            <Eraser className="h-4 w-4" />
                            Clear
                        </button>
                    }
                >
                    {results.length > 0 ? (
                        <div className="overflow-hidden rounded-md border">
                            <div className="grid grid-cols-[6rem_minmax(0,1fr)_2.5rem] border-b bg-muted/30 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[7rem_minmax(0,1fr)_8rem_3rem]">
                                <span>Extension</span>
                                <span>MIME type</span>
                                <span className="hidden sm:block">Category</span>
                                <span className="sr-only">Copy</span>
                            </div>
                            <div className="divide-y">
                                {results.map((record) => {
                                    const key = `${record.extension}-${record.type}`;
                                    return (
                                        <div key={key} className="grid grid-cols-[6rem_minmax(0,1fr)_2.5rem] items-center gap-2 px-3 py-2 text-sm sm:grid-cols-[7rem_minmax(0,1fr)_8rem_3rem]">
                                            <span className="font-mono text-foreground">.{record.extension}</span>
                                            <div className="min-w-0">
                                                <code className="block truncate text-foreground">{record.type}</code>
                                                <span className="block truncate text-xs text-muted-foreground">{record.description}</span>
                                            </div>
                                            <span className="hidden text-muted-foreground sm:block">{record.category}</span>
                                            <ToolIconButton
                                                type="button"
                                                title={`Copy ${record.type}`}
                                                aria-label={`Copy ${record.type}`}
                                                onClick={() => copyValue(record.type, key)}
                                            >
                                                {copiedKey === key ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                            </ToolIconButton>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <ToolStatus tone="warning">
                            No MIME types matched this lookup.
                        </ToolStatus>
                    )}
                </ToolPanel>

                <ToolActionBar>
                    <button type="button" onClick={() => setQuery('application/json')} className="btn btn-secondary gap-2">
                        <FileSearch className="h-4 w-4" />
                        Try application/json
                    </button>
                    <button type="button" onClick={() => setQuery('png')} className="btn btn-secondary gap-2">
                        <FileSearch className="h-4 w-4" />
                        Try png
                    </button>
                </ToolActionBar>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Matches" value={results.length} />
                    <ToolMetric label="Known types" value={mimeTypes.length} />
                    <ToolMetric label="Categories" value={categories.length - 1} />
                </div>
            </div>
        </ToolLayout>
    );
}
