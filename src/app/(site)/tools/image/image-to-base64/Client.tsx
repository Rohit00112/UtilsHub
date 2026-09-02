'use client';

import { useCallback, useMemo, useState } from 'react';
import { Check, Clipboard, ImageIcon, Trash2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolMetric,
    ToolPanel,
    ToolTextarea,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

/* ------------------------------------------------------------------ */
/*  Format bytes helper                                                */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyBtn({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
    };
    return (
        <button
            type="button"
            onClick={copy}
            className="btn btn-secondary h-8 gap-2 px-3 text-xs"
        >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : label}
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ImageToBase64() {
    const [dataUri, setDataUri] = useToolState('image-to-base64', 'dataUri', '');
    const [fileName, setFileName] = useToolState('image-to-base64', 'fileName', '');
    const [fileSize, setFileSize] = useToolState('image-to-base64', 'fileSize', 0);
    const [mimeType, setMimeType] = useToolState('image-to-base64', 'mimeType', '');
    const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

    const rawBase64 = useMemo(() => {
        if (!dataUri) return '';
        const idx = dataUri.indexOf(',');
        return idx >= 0 ? dataUri.slice(idx + 1) : '';
    }, [dataUri]);

    const imgTag = useMemo(() => {
        if (!dataUri) return '';
        const alt = fileName ? fileName.replace(/\.[^.]+$/, '') : 'image';
        return `<img src="${dataUri}" alt="${alt}" />`;
    }, [dataUri, fileName]);

    const base64Size = useMemo(() => rawBase64.length, [rawBase64]);

    const handleFile = useCallback((file: File) => {
        setFileName(file.name);
        setFileSize(file.size);
        setMimeType(file.type);
        setDimensions(null);

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setDataUri(result);

            // Get image dimensions
            const img = new Image();
            img.onload = () => setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
            img.src = result;
        };
        reader.readAsDataURL(file);
    }, [setDataUri, setFileName, setFileSize, setMimeType]);

    const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const clear = () => {
        setDataUri('');
        setFileName('');
        setFileSize(0);
        setMimeType('');
        setDimensions(null);
    };

    return (
        <ToolLayout title="Image to Base64" description="Convert images to Base64 strings, data URIs, and HTML img tags" category="image">
            <div className="mx-auto max-w-5xl space-y-6">

                {/* ── Upload ────────────────────────────────────── */}
                {!dataUri ? (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <ToolUploadZone
                            title="Upload or drag-and-drop an image"
                            description="JPEG, PNG, GIF, WebP, SVG, and more"
                            icon={<ImageIcon className="h-8 w-8" />}
                            inputProps={{
                                type: 'file',
                                accept: 'image/*',
                                onChange: handleUpload,
                            }}
                        />
                    </div>
                ) : (
                    <>
                        {/* ── Preview & Metadata ────────────────── */}
                        <ToolPanel
                            title="Image preview"
                            actions={
                                <button onClick={clear} className="btn btn-secondary h-8 gap-2 px-3">
                                    <Trash2 className="h-4 w-4" />Remove
                                </button>
                            }
                        >
                            <div className="flex flex-col gap-6 lg:flex-row">
                                <div className="flex items-center justify-center rounded-xl border bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-4 lg:w-72 lg:flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={dataUri}
                                        alt={fileName}
                                        className="max-h-56 max-w-full rounded object-contain"
                                    />
                                </div>
                                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                                    <ToolMetric label="File name" value={fileName} />
                                    <ToolMetric label="Original size" value={formatBytes(fileSize)} />
                                    <ToolMetric label="MIME type" value={mimeType || 'unknown'} />
                                    <ToolMetric label="Dimensions" value={dimensions ? `${dimensions.w} × ${dimensions.h}` : '—'} />
                                    <ToolMetric label="Base64 length" value={formatBytes(base64Size)} description={`${((base64Size / fileSize) * 100).toFixed(0)}% of original (in text)`} />
                                </div>
                            </div>
                        </ToolPanel>

                        {/* ── Raw Base64 ────────────────────────── */}
                        <ToolPanel
                            title="Raw Base64"
                            description="The Base64-encoded string without the data URI prefix."
                            actions={<CopyBtn text={rawBase64} label="Copy Base64" />}
                        >
                            <ToolTextarea
                                value={rawBase64}
                                readOnly
                                className="min-h-32 break-all"
                                placeholder="Base64 output..."
                            />
                        </ToolPanel>

                        {/* ── Data URI ──────────────────────────── */}
                        <ToolPanel
                            title="Data URI"
                            description="Drop this into a CSS background-image or an img src attribute."
                            actions={<CopyBtn text={dataUri} label="Copy data URI" />}
                        >
                            <ToolTextarea
                                value={dataUri}
                                readOnly
                                className="min-h-32 break-all"
                                placeholder="data: URI..."
                            />
                        </ToolPanel>

                        {/* ── HTML img tag ──────────────────────── */}
                        <ToolPanel
                            title="HTML <img> tag"
                            description="A ready-to-paste img element with the data URI embedded."
                            actions={<CopyBtn text={imgTag} label="Copy HTML" />}
                        >
                            <ToolTextarea
                                value={imgTag}
                                readOnly
                                className="min-h-20 break-all"
                                placeholder="<img> tag..."
                            />
                        </ToolPanel>
                    </>
                )}
            </div>
        </ToolLayout>
    );
}
