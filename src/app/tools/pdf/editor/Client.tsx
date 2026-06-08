'use client';

import { useMemo, useState } from 'react';
import { Download, FileText, Highlighter, Pencil, Plus, Square, Trash2, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolEmptyState,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolResultCard,
    ToolSegmentedControl,
    ToolStatus,
    ToolTextarea,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';

type AnnotationType = 'text' | 'highlight' | 'rectangle';

interface PageSize {
    width: number;
    height: number;
}

interface PdfState {
    file: File;
    bytes: ArrayBuffer;
    pageCount: number;
    pageSizes: PageSize[];
}

interface Annotation {
    id: string;
    type: AnnotationType;
    page: number;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    color: string;
    opacity: number;
}

interface EditResult {
    name: string;
    url: string;
    size: number;
}

const defaultAnnotation: Omit<Annotation, 'id'> = {
    type: 'text',
    page: 1,
    text: 'Approved',
    x: 72,
    y: 72,
    width: 180,
    height: 36,
    fontSize: 18,
    color: '#2563eb',
    opacity: 0.85,
};

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** sizeIndex).toFixed(sizeIndex === 0 ? 0 : 1)} ${units[sizeIndex]}`;
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return buffer;
}

function downloadBlob(url: string, name: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
}

function hexToRgb(hex: string) {
    const normalized = hex.replace('#', '');
    const value = /^[0-9a-fA-F]{6}$/.test(normalized) ? normalized : '2563eb';
    return {
        r: parseInt(value.slice(0, 2), 16) / 255,
        g: parseInt(value.slice(2, 4), 16) / 255,
        b: parseInt(value.slice(4, 6), 16) / 255,
    };
}

function createAnnotation(seed: Partial<Annotation> = {}): Annotation {
    return {
        ...defaultAnnotation,
        ...seed,
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    };
}

export default function PDFEditor() {
    const [pdf, setPdf] = useState<PdfState | null>(null);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [draft, setDraft] = useState<Annotation>(() => createAnnotation());
    const [result, setResult] = useState<EditResult | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const selectedPageSize = useMemo(() => {
        if (!pdf) return null;
        return pdf.pageSizes[Math.min(Math.max(draft.page, 1), pdf.pageCount) - 1] || null;
    }, [draft.page, pdf]);

    const clearResult = () => {
        if (result) URL.revokeObjectURL(result.url);
        setResult(null);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        event.target.value = '';
        clearResult();
        setPdf(null);
        setAnnotations([]);
        setError('');

        if (!selected) return;

        try {
            const { PDFDocument } = await import('pdf-lib');
            const bytes = await selected.arrayBuffer();
            const doc = await PDFDocument.load(bytes);
            const pageSizes = doc.getPages().map((page) => page.getSize());
            setPdf({
                file: selected,
                bytes,
                pageCount: doc.getPageCount(),
                pageSizes,
            });
            setDraft((current) => ({ ...current, page: 1 }));
        } catch {
            setError('Unable to read this PDF. Password-protected or malformed PDFs may not be supported.');
        }
    };

    const updateDraft = (changes: Partial<Annotation>) => {
        setDraft((current) => ({ ...current, ...changes }));
    };

    const addAnnotation = () => {
        if (!pdf) {
            setError('Choose a PDF before adding annotations.');
            return;
        }

        const page = Math.min(Math.max(Number(draft.page) || 1, 1), pdf.pageCount);
        const next = {
            ...draft,
            page,
            x: Number(draft.x) || 0,
            y: Number(draft.y) || 0,
            width: Math.max(Number(draft.width) || 1, 1),
            height: Math.max(Number(draft.height) || 1, 1),
            fontSize: Math.max(Number(draft.fontSize) || 1, 1),
            opacity: Math.min(Math.max(Number(draft.opacity) || 1, 0.05), 1),
            id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        };

        if (next.type === 'text' && !next.text.trim()) {
            setError('Enter text before adding a text annotation.');
            return;
        }

        clearResult();
        setError('');
        setAnnotations((current) => [...current, next]);
    };

    const removeAnnotation = (id: string) => {
        clearResult();
        setAnnotations((current) => current.filter((annotation) => annotation.id !== id));
    };

    const clearAll = () => {
        clearResult();
        setPdf(null);
        setAnnotations([]);
        setError('');
    };

    const applyEdits = async () => {
        if (!pdf) {
            setError('Choose a PDF before applying edits.');
            return;
        }

        if (annotations.length === 0) {
            setError('Add at least one annotation before downloading an edited PDF.');
            return;
        }

        clearResult();
        setError('');
        setIsProcessing(true);

        try {
            const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
            const doc = await PDFDocument.load(pdf.bytes);
            const helvetica = await doc.embedFont(StandardFonts.Helvetica);

            annotations.forEach((annotation) => {
                const page = doc.getPage(annotation.page - 1);
                const { r, g, b } = hexToRgb(annotation.color);
                const color = rgb(r, g, b);

                if (annotation.type === 'text') {
                    page.drawText(annotation.text, {
                        x: annotation.x,
                        y: annotation.y,
                        size: annotation.fontSize,
                        font: helvetica,
                        color,
                        opacity: annotation.opacity,
                    });
                    return;
                }

                page.drawRectangle({
                    x: annotation.x,
                    y: annotation.y,
                    width: annotation.width,
                    height: annotation.height,
                    color: annotation.type === 'highlight' ? color : undefined,
                    borderColor: annotation.type === 'rectangle' ? color : undefined,
                    borderWidth: annotation.type === 'rectangle' ? 2 : 0,
                    opacity: annotation.opacity,
                });
            });

            doc.setCreator('UtilsHub');
            doc.setProducer('UtilsHub PDF Editor');
            const output = bytesToArrayBuffer(await doc.save({ useObjectStreams: true }));
            const baseName = pdf.file.name.replace(/\.pdf$/i, '') || 'edited-pdf';
            const name = `${baseName}-edited.pdf`;
            const url = URL.createObjectURL(new Blob([output], { type: 'application/pdf' }));

            setResult({ name, url, size: output.byteLength });
        } catch {
            setError('Unable to apply edits to this PDF. Try a different file or fewer annotations.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="PDF Editor"
            description="Add text, highlight, and rectangle annotations to PDF pages in your browser"
            category="pdf"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="PDF file">
                    <ToolUploadZone
                        title={pdf ? pdf.file.name : 'Choose a PDF file'}
                        description={pdf ? `${pdf.pageCount} pages, ${formatBytes(pdf.file.size)}` : 'The PDF stays in your browser.'}
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'application/pdf,.pdf', onChange: handleFileChange }}
                    />
                    {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                </ToolPanel>

                <div className="grid gap-3 sm:grid-cols-4">
                    <ToolMetric label="Pages" value={pdf?.pageCount || 0} />
                    <ToolMetric label="Annotations" value={annotations.length} />
                    <ToolMetric label="Selected page" value={draft.page} />
                    <ToolMetric
                        label="Page size"
                        value={selectedPageSize ? `${Math.round(selectedPageSize.width)} x ${Math.round(selectedPageSize.height)}` : '-'}
                        description="PDF points"
                    />
                </div>

                <ToolPanel
                    title="Add annotation"
                    description="Coordinates use PDF points from the bottom-left of the selected page."
                >
                    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                        <ToolField label="Type">
                            <ToolSegmentedControl
                                value={draft.type}
                                onChange={(type) => updateDraft({ type })}
                                options={[
                                    { label: 'Text', value: 'text' },
                                    { label: 'Highlight', value: 'highlight' },
                                    { label: 'Box', value: 'rectangle' },
                                ]}
                            />
                        </ToolField>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <ToolField label="Page" htmlFor="pdf-page">
                                <input
                                    id="pdf-page"
                                    type="number"
                                    min="1"
                                    max={pdf?.pageCount || 1}
                                    value={draft.page}
                                    onChange={(event) => updateDraft({ page: Number(event.target.value) })}
                                    className="input h-10"
                                />
                            </ToolField>
                            <ToolField label="X" htmlFor="pdf-x">
                                <input id="pdf-x" type="number" value={draft.x} onChange={(event) => updateDraft({ x: Number(event.target.value) })} className="input h-10" />
                            </ToolField>
                            <ToolField label="Y" htmlFor="pdf-y">
                                <input id="pdf-y" type="number" value={draft.y} onChange={(event) => updateDraft({ y: Number(event.target.value) })} className="input h-10" />
                            </ToolField>
                            <ToolField label="Color" htmlFor="pdf-color">
                                <input id="pdf-color" type="color" value={draft.color} onChange={(event) => updateDraft({ color: event.target.value })} className="h-10 w-full cursor-pointer rounded border bg-transparent" />
                            </ToolField>
                        </div>
                    </div>

                    {draft.type === 'text' ? (
                        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_160px_160px]">
                            <ToolField label="Text" htmlFor="pdf-text">
                                <ToolTextarea
                                    id="pdf-text"
                                    value={draft.text}
                                    onChange={(event) => updateDraft({ text: event.target.value })}
                                    className="min-h-24"
                                    placeholder="Text to add to the PDF"
                                />
                            </ToolField>
                            <ToolField label="Font size" htmlFor="pdf-font-size">
                                <input id="pdf-font-size" type="number" min="1" value={draft.fontSize} onChange={(event) => updateDraft({ fontSize: Number(event.target.value) })} className="input h-10" />
                            </ToolField>
                            <ToolField label="Opacity" htmlFor="pdf-text-opacity">
                                <input id="pdf-text-opacity" type="number" min="0.05" max="1" step="0.05" value={draft.opacity} onChange={(event) => updateDraft({ opacity: Number(event.target.value) })} className="input h-10" />
                            </ToolField>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <ToolField label="Width" htmlFor="pdf-width">
                                <input id="pdf-width" type="number" min="1" value={draft.width} onChange={(event) => updateDraft({ width: Number(event.target.value) })} className="input h-10" />
                            </ToolField>
                            <ToolField label="Height" htmlFor="pdf-height">
                                <input id="pdf-height" type="number" min="1" value={draft.height} onChange={(event) => updateDraft({ height: Number(event.target.value) })} className="input h-10" />
                            </ToolField>
                            <ToolField label="Opacity" htmlFor="pdf-shape-opacity">
                                <input id="pdf-shape-opacity" type="number" min="0.05" max="1" step="0.05" value={draft.opacity} onChange={(event) => updateDraft({ opacity: Number(event.target.value) })} className="input h-10" />
                            </ToolField>
                        </div>
                    )}

                    <ToolActionBar className="mt-5 justify-center">
                        <button type="button" onClick={addAnnotation} disabled={!pdf} className="btn btn-primary gap-2">
                            <Plus className="h-4 w-4" />
                            Add annotation
                        </button>
                    </ToolActionBar>
                </ToolPanel>

                <ToolPanel
                    title="Annotation queue"
                    description={annotations.length > 0 ? 'Annotations are applied in the order listed.' : 'Add annotations before generating the edited PDF.'}
                    actions={
                        <ToolActionBar>
                            <button type="button" onClick={() => setAnnotations([])} disabled={annotations.length === 0} className="btn btn-secondary h-8 px-3">
                                Clear annotations
                            </button>
                            <button type="button" onClick={applyEdits} disabled={!pdf || annotations.length === 0 || isProcessing} className="btn btn-primary h-8 gap-2 px-3">
                                <FileText className="h-4 w-4" />
                                {isProcessing ? 'Applying' : 'Apply edits'}
                            </button>
                        </ToolActionBar>
                    }
                >
                    {annotations.length === 0 ? (
                        <ToolEmptyState title="No annotations yet" description="Choose a PDF and add text, highlight, or box annotations." />
                    ) : (
                        <div className="divide-y rounded-md border">
                            {annotations.map((annotation, index) => (
                                <div key={annotation.id} className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/20 text-muted-foreground">
                                        {annotation.type === 'text' ? <Pencil className="h-4 w-4" /> : annotation.type === 'highlight' ? <Highlighter className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-foreground">
                                            #{index + 1} {annotation.type} on page {annotation.page}
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            x {annotation.x}, y {annotation.y}
                                            {annotation.type === 'text'
                                                ? ` - "${annotation.text.slice(0, 80)}"`
                                                : ` - ${annotation.width} x ${annotation.height}`}
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeAnnotation(annotation.id)} className="btn btn-secondary h-8 gap-2 px-3 justify-self-start md:justify-self-end">
                                        <Trash2 className="h-4 w-4" />
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>

                <ToolPanel title="Edited PDF" description={result ? 'Your edited PDF is ready.' : 'Output will appear after applying edits.'}>
                    {!result ? (
                        <ToolEmptyState title="No edited file yet" description="Add annotations, then apply edits to create a downloadable PDF." />
                    ) : (
                        <ToolResultCard
                            title={result.name}
                            meta={formatBytes(result.size)}
                            actions={
                                <button type="button" onClick={() => downloadBlob(result.url, result.name)} className="btn btn-secondary gap-2">
                                    <Download className="h-4 w-4" />
                                    Download
                                </button>
                            }
                        />
                    )}
                </ToolPanel>

                <ToolActionBar className="justify-center">
                    <button type="button" onClick={clearAll} className="btn btn-secondary">
                        Reset editor
                    </button>
                </ToolActionBar>
            </div>
        </ToolLayout>
    );
}
