'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
    Download,
    Eraser,
    FileText,
    Highlighter,
    MousePointer2,
    Pencil,
    RotateCcw,
    Square,
    Trash2,
    Upload,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolEmptyState,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolResultCard,
    ToolStatus,
    ToolTextarea,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { cn } from '@/lib/cn';

type AnnotationType = 'text' | 'highlight' | 'rectangle' | 'whiteout';
type EditorTool = 'select' | AnnotationType;

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

interface DraftSettings {
    text: string;
    width: number;
    height: number;
    fontSize: number;
    color: string;
    opacity: number;
}

interface RenderInfo {
    width: number;
    height: number;
    scale: number;
}

interface DragState {
    id: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
}

interface EditResult {
    name: string;
    url: string;
    size: number;
}

const toolOptions: Array<{ label: string; value: EditorTool; icon: typeof MousePointer2 }> = [
    { label: 'Select', value: 'select', icon: MousePointer2 },
    { label: 'Text', value: 'text', icon: Pencil },
    { label: 'Highlight', value: 'highlight', icon: Highlighter },
    { label: 'Box', value: 'rectangle', icon: Square },
    { label: 'Whiteout', value: 'whiteout', icon: Eraser },
];

const initialDrafts: Record<AnnotationType, DraftSettings> = {
    text: {
        text: 'Approved',
        width: 220,
        height: 54,
        fontSize: 18,
        color: '#2563eb',
        opacity: 0.9,
    },
    highlight: {
        text: '',
        width: 220,
        height: 34,
        fontSize: 18,
        color: '#facc15',
        opacity: 0.35,
    },
    rectangle: {
        text: '',
        width: 180,
        height: 110,
        fontSize: 18,
        color: '#dc2626',
        opacity: 0.9,
    },
    whiteout: {
        text: '',
        width: 220,
        height: 42,
        fontSize: 18,
        color: '#ffffff',
        opacity: 1,
    },
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

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function toFiniteNumber(value: number, fallback: number) {
    return Number.isFinite(value) ? value : fallback;
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

function hexToRgba(hex: string, opacity: number) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${opacity})`;
}

function createId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function getTextHeight(fontSize: number, text: string) {
    const lineCount = Math.max(text.split(/\r?\n/).length, 1);
    return Math.max(fontSize * 1.4 * lineCount, fontSize * 1.6);
}

function clampAnnotation(annotation: Annotation, pageSize: PageSize): Annotation {
    const width = clamp(toFiniteNumber(annotation.width, 1), 1, pageSize.width);
    const height = clamp(toFiniteNumber(annotation.height, 1), 1, pageSize.height);

    return {
        ...annotation,
        width,
        height,
        fontSize: Math.max(toFiniteNumber(annotation.fontSize, 18), 1),
        opacity: clamp(toFiniteNumber(annotation.opacity, 1), 0.05, 1),
        x: clamp(toFiniteNumber(annotation.x, 0), 0, Math.max(pageSize.width - width, 0)),
        y: clamp(toFiniteNumber(annotation.y, 0), 0, Math.max(pageSize.height - height, 0)),
    };
}

function annotationTitle(annotation: Annotation) {
    if (annotation.type === 'text') return annotation.text.trim() || 'Text';
    if (annotation.type === 'highlight') return 'Highlight';
    if (annotation.type === 'whiteout') return 'Whiteout';
    return 'Box';
}

function getAnnotationIcon(type: AnnotationType) {
    if (type === 'text') return <Pencil className="h-4 w-4" />;
    if (type === 'highlight') return <Highlighter className="h-4 w-4" />;
    if (type === 'whiteout') return <Eraser className="h-4 w-4" />;
    return <Square className="h-4 w-4" />;
}

export default function PDFEditor() {
    const [pdf, setPdf] = useState<PdfState | null>(null);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [activeTool, setActiveTool] = useState<EditorTool>('select');
    const [drafts, setDrafts] = useState<Record<AnnotationType, DraftSettings>>(initialDrafts);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [renderInfo, setRenderInfo] = useState<RenderInfo | null>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [result, setResult] = useState<EditResult | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [resizeTick, setResizeTick] = useState(0);

    const previewRef = useRef<HTMLDivElement>(null);
    const pageFrameRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const selectedAnnotation = useMemo(
        () => annotations.find((annotation) => annotation.id === selectedId) || null,
        [annotations, selectedId]
    );

    const pageAnnotations = useMemo(
        () => annotations.filter((annotation) => annotation.page === currentPage),
        [annotations, currentPage]
    );

    const activeDraft = activeTool === 'select' ? null : drafts[activeTool];
    const currentPageSize = pdf?.pageSizes[currentPage - 1] || null;

    const clearResult = () => {
        setResult((current) => {
            if (current) URL.revokeObjectURL(current.url);
            return null;
        });
    };

    useEffect(() => {
        return () => {
            if (result) URL.revokeObjectURL(result.url);
        };
    }, [result]);

    useEffect(() => {
        const handleResize = () => setResizeTick((tick) => tick + 1);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!pdf || !canvasRef.current) {
            setRenderInfo(null);
            return;
        }

        let cancelled = false;
        let renderTask: { cancel: () => void; promise: Promise<unknown> } | null = null;

        const renderPage = async () => {
            setIsRendering(true);

            try {
                const pdfjsLib = await import('pdfjs-dist');
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

                const loadingTask = pdfjsLib.getDocument({ data: pdf.bytes.slice(0) });
                const pdfDoc = await loadingTask.promise;
                const page = await pdfDoc.getPage(currentPage);
                const canvas = canvasRef.current;
                const context = canvas?.getContext('2d');

                if (!canvas || !context || cancelled) return;

                const pageSize = pdf.pageSizes[currentPage - 1];
                const availableWidth = Math.max((previewRef.current?.clientWidth || 860) - 32, 320);
                const baseScale = Math.min(availableWidth / pageSize.width, 1.5);
                const scale = clamp(baseScale * zoom, 0.25, 3);
                const viewport = page.getViewport({ scale });
                const deviceRatio = window.devicePixelRatio || 1;

                canvas.width = Math.floor(viewport.width * deviceRatio);
                canvas.height = Math.floor(viewport.height * deviceRatio);
                canvas.style.width = `${viewport.width}px`;
                canvas.style.height = `${viewport.height}px`;

                const transform: [number, number, number, number, number, number] | undefined =
                    deviceRatio !== 1 ? [deviceRatio, 0, 0, deviceRatio, 0, 0] : undefined;

                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, canvas.width, canvas.height);

                renderTask = page.render({ canvas, canvasContext: context, transform, viewport });
                await renderTask.promise;
                await pdfDoc.destroy();

                if (!cancelled) {
                    setRenderInfo({
                        width: viewport.width,
                        height: viewport.height,
                        scale,
                    });
                    setError('');
                }
            } catch (renderError) {
                const name = renderError instanceof Error ? renderError.name : '';
                if (!cancelled && name !== 'RenderingCancelledException') {
                    setError('Unable to render this PDF page. Try another PDF or reload the file.');
                }
            } finally {
                if (!cancelled) setIsRendering(false);
            }
        };

        renderPage();

        return () => {
            cancelled = true;
            renderTask?.cancel();
        };
    }, [currentPage, pdf, resizeTick, zoom]);

    useEffect(() => {
        if (!dragState || !pdf || !renderInfo) return;

        const handlePointerMove = (event: PointerEvent) => {
            const pageSize = pdf.pageSizes[currentPage - 1];
            const dx = (event.clientX - dragState.startClientX) / renderInfo.scale;
            const dy = (event.clientY - dragState.startClientY) / renderInfo.scale;

            clearResult();
            setAnnotations((current) =>
                current.map((annotation) => {
                    if (annotation.id !== dragState.id) return annotation;
                    return clampAnnotation(
                        {
                            ...annotation,
                            x: dragState.startX + dx,
                            y: dragState.startY - dy,
                        },
                        pageSize
                    );
                })
            );
        };

        const handlePointerUp = () => setDragState(null);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [currentPage, dragState, pdf, renderInfo]);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        event.target.value = '';
        clearResult();
        setPdf(null);
        setAnnotations([]);
        setSelectedId(null);
        setCurrentPage(1);
        setZoom(1);
        setRenderInfo(null);
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
        } catch {
            setError('Unable to read this PDF. Password-protected or malformed PDFs may not be supported.');
        }
    };

    const updateDraft = (changes: Partial<DraftSettings>) => {
        if (activeTool === 'select') return;
        setDrafts((current) => ({
            ...current,
            [activeTool]: {
                ...current[activeTool],
                ...changes,
            },
        }));
    };

    const updateAnnotation = (id: string, changes: Partial<Annotation>) => {
        if (!pdf) return;
        clearResult();
        setAnnotations((current) =>
            current.map((annotation) => {
                if (annotation.id !== id) return annotation;
                const pageSize = pdf.pageSizes[annotation.page - 1];
                return clampAnnotation({ ...annotation, ...changes }, pageSize);
            })
        );
    };

    const placeAnnotation = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!pdf || !renderInfo || !currentPageSize || activeTool === 'select') return;
        if (dragState) return;

        const frame = pageFrameRef.current;
        if (!frame) return;

        const rect = frame.getBoundingClientRect();
        const localX = clamp(event.clientX - rect.left, 0, renderInfo.width);
        const localY = clamp(event.clientY - rect.top, 0, renderInfo.height);
        const draft = drafts[activeTool];
        const width = Math.min(Math.max(draft.width, 1), currentPageSize.width);
        const height = activeTool === 'text'
            ? Math.min(Math.max(draft.height, getTextHeight(draft.fontSize, draft.text)), currentPageSize.height)
            : Math.min(Math.max(draft.height, 1), currentPageSize.height);
        const x = localX / renderInfo.scale;
        const y = currentPageSize.height - localY / renderInfo.scale - height;

        const annotation = clampAnnotation(
            {
                id: createId(),
                type: activeTool,
                page: currentPage,
                text: draft.text,
                x,
                y,
                width,
                height,
                fontSize: draft.fontSize,
                color: activeTool === 'whiteout' ? '#ffffff' : draft.color,
                opacity: activeTool === 'whiteout' ? 1 : draft.opacity,
            },
            currentPageSize
        );

        if (annotation.type === 'text' && !annotation.text.trim()) {
            setError('Enter text before placing a text edit.');
            return;
        }

        clearResult();
        setError('');
        setAnnotations((current) => [...current, annotation]);
        setSelectedId(annotation.id);
        setActiveTool('select');
    };

    const startDrag = (event: React.PointerEvent<HTMLButtonElement>, annotation: Annotation) => {
        event.stopPropagation();
        setActiveTool('select');
        setSelectedId(annotation.id);
        setDragState({
            id: annotation.id,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startX: annotation.x,
            startY: annotation.y,
        });
    };

    const removeAnnotation = (id: string) => {
        clearResult();
        setAnnotations((current) => current.filter((annotation) => annotation.id !== id));
        setSelectedId((current) => (current === id ? null : current));
    };

    const clearPageAnnotations = () => {
        clearResult();
        setAnnotations((current) => current.filter((annotation) => annotation.page !== currentPage));
        setSelectedId(null);
    };

    const clearAll = () => {
        clearResult();
        setPdf(null);
        setAnnotations([]);
        setSelectedId(null);
        setCurrentPage(1);
        setZoom(1);
        setRenderInfo(null);
        setError('');
    };

    const applyEdits = async () => {
        if (!pdf) {
            setError('Choose a PDF before applying edits.');
            return;
        }

        if (annotations.length === 0) {
            setError('Place at least one edit before downloading an edited PDF.');
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
                const opacity = clamp(annotation.opacity, 0.05, 1);

                if (annotation.type === 'text') {
                    const { r, g, b } = hexToRgb(annotation.color);
                    const lines = annotation.text.split(/\r?\n/);
                    const lineHeight = annotation.fontSize * 1.25;
                    const topY = annotation.y + annotation.height - annotation.fontSize;

                    lines.forEach((line, index) => {
                        page.drawText(line || ' ', {
                            x: annotation.x,
                            y: topY - index * lineHeight,
                            size: annotation.fontSize,
                            font: helvetica,
                            color: rgb(r, g, b),
                            opacity,
                        });
                    });
                    return;
                }

                if (annotation.type === 'whiteout') {
                    page.drawRectangle({
                        x: annotation.x,
                        y: annotation.y,
                        width: annotation.width,
                        height: annotation.height,
                        color: rgb(1, 1, 1),
                        opacity: 1,
                    });
                    return;
                }

                const { r, g, b } = hexToRgb(annotation.color);
                const color = rgb(r, g, b);

                page.drawRectangle({
                    x: annotation.x,
                    y: annotation.y,
                    width: annotation.width,
                    height: annotation.height,
                    color: annotation.type === 'highlight' ? color : undefined,
                    borderColor: annotation.type === 'rectangle' ? color : undefined,
                    borderWidth: annotation.type === 'rectangle' ? 2 : 0,
                    opacity,
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
            setError('Unable to apply edits to this PDF. Try a different file or fewer edits.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="PDF Editor"
            description="Edit PDF pages visually with text, highlights, boxes, and whiteout overlays"
            category="pdf"
        >
            <div className="mx-auto max-w-7xl space-y-6">
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
                    <ToolMetric label="Current page" value={pdf ? currentPage : 0} />
                    <ToolMetric label="Edits" value={annotations.length} />
                    <ToolMetric label="Zoom" value={`${Math.round(zoom * 100)}%`} />
                </div>

                <ToolPanel
                    title="Visual editor"
                    description={pdf ? 'Select a tool, click the page to place it, then drag edits into position.' : 'Upload a PDF to render its pages and start editing.'}
                    actions={
                        <ToolActionBar>
                            <button
                                type="button"
                                onClick={applyEdits}
                                disabled={!pdf || annotations.length === 0 || isProcessing}
                                className="btn btn-primary h-9 gap-2 px-3"
                            >
                                <FileText className="h-4 w-4" />
                                {isProcessing ? 'Applying' : 'Apply edits'}
                            </button>
                            <button type="button" onClick={clearAll} className="btn btn-secondary h-9 gap-2 px-3">
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </button>
                        </ToolActionBar>
                    }
                >
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="min-w-0">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <ToolActionBar>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                        disabled={!pdf || currentPage <= 1}
                                        className="btn btn-secondary h-9 px-3"
                                    >
                                        Previous
                                    </button>
                                    <ToolField label="Page" htmlFor="pdf-editor-page" className="w-28">
                                        <input
                                            id="pdf-editor-page"
                                            type="number"
                                            min="1"
                                            max={pdf?.pageCount || 1}
                                            value={currentPage}
                                            disabled={!pdf}
                                            onChange={(event) => {
                                                const page = clamp(Number(event.target.value) || 1, 1, pdf?.pageCount || 1);
                                                setCurrentPage(page);
                                                setSelectedId(null);
                                            }}
                                            className="input h-9"
                                        />
                                    </ToolField>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.min(page + 1, pdf?.pageCount || page))}
                                        disabled={!pdf || currentPage >= (pdf?.pageCount || 1)}
                                        className="btn btn-secondary h-9 px-3"
                                    >
                                        Next
                                    </button>
                                </ToolActionBar>

                                <ToolActionBar>
                                    <button
                                        type="button"
                                        onClick={() => setZoom((value) => clamp(Number((value - 0.1).toFixed(2)), 0.5, 2))}
                                        disabled={!pdf || zoom <= 0.5}
                                        className="btn btn-secondary h-9 w-9 p-0"
                                        title="Zoom out"
                                        aria-label="Zoom out"
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setZoom(1)}
                                        disabled={!pdf || zoom === 1}
                                        className="btn btn-secondary h-9 px-3"
                                    >
                                        100%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setZoom((value) => clamp(Number((value + 0.1).toFixed(2)), 0.5, 2))}
                                        disabled={!pdf || zoom >= 2}
                                        className="btn btn-secondary h-9 w-9 p-0"
                                        title="Zoom in"
                                        aria-label="Zoom in"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </button>
                                </ToolActionBar>
                            </div>

                            {!pdf ? (
                                <ToolEmptyState
                                    icon={<FileText className="h-8 w-8" />}
                                    title="No PDF loaded"
                                    description="Choose a PDF above to open it in the visual editor."
                                />
                            ) : (
                                <div ref={previewRef} className="overflow-auto rounded-lg border bg-muted/30 p-4">
                                    <div
                                        ref={pageFrameRef}
                                        onClick={placeAnnotation}
                                        className={cn(
                                            'relative mx-auto bg-white shadow-xl ring-1 ring-border',
                                            activeTool !== 'select' && 'cursor-crosshair'
                                        )}
                                        style={{
                                            width: renderInfo?.width || 1,
                                            height: renderInfo?.height || 1,
                                        }}
                                    >
                                        <canvas ref={canvasRef} className="block" />

                                        {renderInfo && currentPageSize && pageAnnotations.map((annotation) => {
                                            const isSelected = annotation.id === selectedId;
                                            const left = annotation.x * renderInfo.scale;
                                            const top = (currentPageSize.height - annotation.y - annotation.height) * renderInfo.scale;
                                            const width = annotation.width * renderInfo.scale;
                                            const height = annotation.height * renderInfo.scale;
                                            const commonStyle = {
                                                left,
                                                top,
                                                width,
                                                height,
                                            };
                                            const shapeStyle = annotation.type === 'highlight'
                                                ? {
                                                    backgroundColor: hexToRgba(annotation.color, annotation.opacity),
                                                    borderColor: isSelected ? '#2563eb' : hexToRgba(annotation.color, 0.7),
                                                }
                                                : annotation.type === 'rectangle'
                                                    ? {
                                                        backgroundColor: 'transparent',
                                                        borderColor: annotation.color,
                                                    }
                                                    : annotation.type === 'whiteout'
                                                        ? {
                                                            backgroundColor: '#ffffff',
                                                            borderColor: isSelected ? '#2563eb' : '#94a3b8',
                                                        }
                                                        : {};

                                            return (
                                                <button
                                                    key={annotation.id}
                                                    type="button"
                                                    onPointerDown={(event) => startDrag(event, annotation)}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setSelectedId(annotation.id);
                                                        setActiveTool('select');
                                                    }}
                                                    className={cn(
                                                        'absolute overflow-hidden rounded-sm text-left transition-shadow',
                                                        isSelected && 'shadow-[0_0_0_2px_rgba(37,99,235,0.9)]',
                                                        annotation.type === 'text'
                                                            ? 'border border-dashed border-primary/60 bg-primary/5 px-1'
                                                            : 'border-2',
                                                        annotation.type === 'rectangle' && 'border-2',
                                                        annotation.type === 'whiteout' && 'border border-dashed'
                                                    )}
                                                    style={{
                                                        ...commonStyle,
                                                        ...shapeStyle,
                                                        color: annotation.color,
                                                        fontSize: annotation.fontSize * renderInfo.scale,
                                                        lineHeight: 1.25,
                                                        opacity: annotation.type === 'text' ? annotation.opacity : 1,
                                                        whiteSpace: 'pre-wrap',
                                                    }}
                                                    title={annotationTitle(annotation)}
                                                >
                                                    {annotation.type === 'text' ? annotation.text : null}
                                                </button>
                                            );
                                        })}

                                        {isRendering && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-sm font-medium text-muted-foreground">
                                                Rendering page
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="space-y-5">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Tools</h3>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {toolOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isActive = activeTool === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setActiveTool(option.value);
                                                    if (option.value !== 'select') setSelectedId(null);
                                                }}
                                                disabled={!pdf && option.value !== 'select'}
                                                className={cn(
                                                    'inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
                                                    isActive
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                )}
                                                title={option.label}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedAnnotation ? (
                                <div className="space-y-4">
                                    <div className="rounded-md border bg-muted/20 p-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            {getAnnotationIcon(selectedAnnotation.type)}
                                            {annotationTitle(selectedAnnotation)}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Page {selectedAnnotation.page}, x {Math.round(selectedAnnotation.x)}, y {Math.round(selectedAnnotation.y)}
                                        </p>
                                    </div>

                                    {selectedAnnotation.type === 'text' && (
                                        <ToolField label="Text" htmlFor="selected-pdf-text">
                                            <ToolTextarea
                                                id="selected-pdf-text"
                                                value={selectedAnnotation.text}
                                                onChange={(event) => updateAnnotation(selectedAnnotation.id, { text: event.target.value })}
                                                className="min-h-24"
                                            />
                                        </ToolField>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <ToolField label="Width" htmlFor="selected-pdf-width">
                                            <input
                                                id="selected-pdf-width"
                                                type="number"
                                                min="1"
                                                value={Math.round(selectedAnnotation.width)}
                                                onChange={(event) => updateAnnotation(selectedAnnotation.id, { width: Number(event.target.value) || 1 })}
                                                className="input h-10"
                                            />
                                        </ToolField>
                                        <ToolField label="Height" htmlFor="selected-pdf-height">
                                            <input
                                                id="selected-pdf-height"
                                                type="number"
                                                min="1"
                                                value={Math.round(selectedAnnotation.height)}
                                                onChange={(event) => updateAnnotation(selectedAnnotation.id, { height: Number(event.target.value) || 1 })}
                                                className="input h-10"
                                            />
                                        </ToolField>
                                    </div>

                                    {selectedAnnotation.type === 'text' && (
                                        <ToolField label="Font size" htmlFor="selected-pdf-font-size">
                                            <input
                                                id="selected-pdf-font-size"
                                                type="number"
                                                min="1"
                                                value={selectedAnnotation.fontSize}
                                                onChange={(event) => updateAnnotation(selectedAnnotation.id, { fontSize: Number(event.target.value) || 1 })}
                                                className="input h-10"
                                            />
                                        </ToolField>
                                    )}

                                    {selectedAnnotation.type !== 'whiteout' && (
                                        <ToolField label="Color" htmlFor="selected-pdf-color">
                                            <input
                                                id="selected-pdf-color"
                                                type="color"
                                                value={selectedAnnotation.color}
                                                onChange={(event) => updateAnnotation(selectedAnnotation.id, { color: event.target.value })}
                                                className="h-10 w-full cursor-pointer rounded border bg-transparent"
                                            />
                                        </ToolField>
                                    )}

                                    {selectedAnnotation.type !== 'whiteout' && (
                                        <ToolField label="Opacity" htmlFor="selected-pdf-opacity">
                                            <input
                                                id="selected-pdf-opacity"
                                                type="range"
                                                min="0.05"
                                                max="1"
                                                step="0.05"
                                                value={selectedAnnotation.opacity}
                                                onChange={(event) => updateAnnotation(selectedAnnotation.id, { opacity: Number(event.target.value) })}
                                                className="w-full"
                                            />
                                        </ToolField>
                                    )}

                                    <ToolActionBar>
                                        <button type="button" onClick={() => removeAnnotation(selectedAnnotation.id)} className="btn btn-secondary gap-2">
                                            <Trash2 className="h-4 w-4" />
                                            Delete selected
                                        </button>
                                    </ToolActionBar>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeTool === 'select' ? (
                                        <ToolStatus tone="info">
                                            Select an edit on the page to move, resize, recolor, or delete it.
                                        </ToolStatus>
                                    ) : (
                                        <>
                                            <ToolStatus tone="info">
                                                Click anywhere on the rendered page to place the {activeTool} edit.
                                            </ToolStatus>

                                            {activeTool === 'text' && activeDraft && (
                                                <ToolField label="Text" htmlFor="new-pdf-text">
                                                    <ToolTextarea
                                                        id="new-pdf-text"
                                                        value={activeDraft.text}
                                                        onChange={(event) => updateDraft({ text: event.target.value })}
                                                        className="min-h-24"
                                                    />
                                                </ToolField>
                                            )}

                                            {activeDraft && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <ToolField label="Width" htmlFor="new-pdf-width">
                                                        <input
                                                            id="new-pdf-width"
                                                            type="number"
                                                            min="1"
                                                            value={activeDraft.width}
                                                            onChange={(event) => updateDraft({ width: Number(event.target.value) || 1 })}
                                                            className="input h-10"
                                                        />
                                                    </ToolField>
                                                    <ToolField label="Height" htmlFor="new-pdf-height">
                                                        <input
                                                            id="new-pdf-height"
                                                            type="number"
                                                            min="1"
                                                            value={activeDraft.height}
                                                            onChange={(event) => updateDraft({ height: Number(event.target.value) || 1 })}
                                                            className="input h-10"
                                                        />
                                                    </ToolField>
                                                </div>
                                            )}

                                            {activeTool === 'text' && activeDraft && (
                                                <ToolField label="Font size" htmlFor="new-pdf-font-size">
                                                    <input
                                                        id="new-pdf-font-size"
                                                        type="number"
                                                        min="1"
                                                        value={activeDraft.fontSize}
                                                        onChange={(event) => updateDraft({ fontSize: Number(event.target.value) || 1 })}
                                                        className="input h-10"
                                                    />
                                                </ToolField>
                                            )}

                                            {activeTool !== 'whiteout' && activeDraft && (
                                                <ToolField label="Color" htmlFor="new-pdf-color">
                                                    <input
                                                        id="new-pdf-color"
                                                        type="color"
                                                        value={activeDraft.color}
                                                        onChange={(event) => updateDraft({ color: event.target.value })}
                                                        className="h-10 w-full cursor-pointer rounded border bg-transparent"
                                                    />
                                                </ToolField>
                                            )}

                                            {activeTool !== 'whiteout' && activeDraft && (
                                                <ToolField label="Opacity" htmlFor="new-pdf-opacity">
                                                    <input
                                                        id="new-pdf-opacity"
                                                        type="range"
                                                        min="0.05"
                                                        max="1"
                                                        step="0.05"
                                                        value={activeDraft.opacity}
                                                        onChange={(event) => updateDraft({ opacity: Number(event.target.value) })}
                                                        className="w-full"
                                                    />
                                                </ToolField>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="rounded-md border bg-muted/20 p-3">
                                <div className="text-sm font-semibold text-foreground">Page edits</div>
                                {pageAnnotations.length === 0 ? (
                                    <p className="mt-2 text-sm text-muted-foreground">No edits on this page yet.</p>
                                ) : (
                                    <div className="mt-2 space-y-2">
                                        {pageAnnotations.map((annotation, index) => (
                                            <button
                                                key={annotation.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedId(annotation.id);
                                                    setActiveTool('select');
                                                }}
                                                className={cn(
                                                    'flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                                                    selectedId === annotation.id && 'border-primary'
                                                )}
                                            >
                                                <span className="text-muted-foreground">{getAnnotationIcon(annotation.type)}</span>
                                                <span className="min-w-0 flex-1 truncate">
                                                    {index + 1}. {annotationTitle(annotation)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={clearPageAnnotations}
                                    disabled={pageAnnotations.length === 0}
                                    className="btn btn-secondary mt-3 h-8 w-full gap-2 px-3"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Clear page edits
                                </button>
                            </div>
                        </aside>
                    </div>
                </ToolPanel>

                <ToolPanel title="Edited PDF" description={result ? 'Your edited PDF is ready.' : 'Output will appear after applying edits.'}>
                    {!result ? (
                        <ToolEmptyState title="No edited file yet" description="Place edits on the page, then apply them to create a downloadable PDF." />
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

                <ToolStatus tone="warning">
                    Whiteout covers page content visually, but it is not secure redaction for sensitive information.
                </ToolStatus>
            </div>
        </ToolLayout>
    );
}
