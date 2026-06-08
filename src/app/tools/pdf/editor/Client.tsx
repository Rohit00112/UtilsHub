'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
    Copy,
    Download,
    Eraser,
    FileText,
    Highlighter,
    Image as ImageIcon,
    Layers,
    Maximize2,
    Minus,
    MousePointer2,
    PenLine,
    Redo2,
    RotateCcw,
    Square,
    Trash2,
    Type,
    Undo2,
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

type AnnotationType = 'text' | 'highlight' | 'rectangle' | 'whiteout' | 'line' | 'pen' | 'image';
type EditorTool = 'select' | AnnotationType;

interface PageSize {
    width: number;
    height: number;
}

interface PdfPoint {
    x: number;
    y: number;
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
    strokeWidth: number;
    points?: PdfPoint[];
    imageDataUrl?: string;
    imageMimeType?: string;
    imageName?: string;
}

interface DraftSettings {
    text: string;
    width: number;
    height: number;
    fontSize: number;
    color: string;
    opacity: number;
    strokeWidth: number;
    imageDataUrl?: string;
    imageMimeType?: string;
    imageName?: string;
    imageAspectRatio?: number;
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
    startAnnotation: Annotation;
    scale: number;
}

interface DrawingState {
    id: string;
    page: number;
}

interface HistoryState {
    past: Annotation[][];
    future: Annotation[][];
}

interface EditResult {
    name: string;
    url: string;
    size: number;
}

const toolOptions: Array<{ label: string; value: EditorTool; icon: typeof MousePointer2 }> = [
    { label: 'Select', value: 'select', icon: MousePointer2 },
    { label: 'Text', value: 'text', icon: Type },
    { label: 'Highlight', value: 'highlight', icon: Highlighter },
    { label: 'Whiteout', value: 'whiteout', icon: Eraser },
    { label: 'Box', value: 'rectangle', icon: Square },
    { label: 'Line', value: 'line', icon: Minus },
    { label: 'Pen', value: 'pen', icon: PenLine },
    { label: 'Image', value: 'image', icon: ImageIcon },
];

const initialDrafts: Record<AnnotationType, DraftSettings> = {
    text: {
        text: 'Approved',
        width: 220,
        height: 54,
        fontSize: 18,
        color: '#2563eb',
        opacity: 0.95,
        strokeWidth: 2,
    },
    highlight: {
        text: '',
        width: 240,
        height: 34,
        fontSize: 18,
        color: '#facc15',
        opacity: 0.35,
        strokeWidth: 2,
    },
    rectangle: {
        text: '',
        width: 180,
        height: 110,
        fontSize: 18,
        color: '#dc2626',
        opacity: 0.95,
        strokeWidth: 2,
    },
    whiteout: {
        text: '',
        width: 240,
        height: 44,
        fontSize: 18,
        color: '#ffffff',
        opacity: 1,
        strokeWidth: 1,
    },
    line: {
        text: '',
        width: 180,
        height: 1,
        fontSize: 18,
        color: '#dc2626',
        opacity: 0.95,
        strokeWidth: 3,
    },
    pen: {
        text: '',
        width: 1,
        height: 1,
        fontSize: 18,
        color: '#2563eb',
        opacity: 0.95,
        strokeWidth: 3,
    },
    image: {
        text: '',
        width: 220,
        height: 140,
        fontSize: 18,
        color: '#2563eb',
        opacity: 1,
        strokeWidth: 1,
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

function getPointBounds(points: PdfPoint[]) {
    if (points.length === 0) return { x: 0, y: 0, width: 1, height: 1 };

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 1),
        height: Math.max(maxY - minY, 1),
    };
}

function getAnnotationBounds(annotation: Annotation) {
    if ((annotation.type === 'line' || annotation.type === 'pen') && annotation.points?.length) {
        return getPointBounds(annotation.points);
    }

    return {
        x: annotation.x,
        y: annotation.y,
        width: annotation.width,
        height: annotation.height,
    };
}

function clampAnnotation(annotation: Annotation, pageSize: PageSize): Annotation {
    if ((annotation.type === 'line' || annotation.type === 'pen') && annotation.points?.length) {
        const bounds = getPointBounds(annotation.points);
        const dx = bounds.x < 0 ? -bounds.x : bounds.x + bounds.width > pageSize.width ? pageSize.width - bounds.x - bounds.width : 0;
        const dy = bounds.y < 0 ? -bounds.y : bounds.y + bounds.height > pageSize.height ? pageSize.height - bounds.y - bounds.height : 0;
        const points = annotation.points.map((point) => ({
            x: clamp(point.x + dx, 0, pageSize.width),
            y: clamp(point.y + dy, 0, pageSize.height),
        }));
        const nextBounds = getPointBounds(points);

        return {
            ...annotation,
            points,
            x: nextBounds.x,
            y: nextBounds.y,
            width: nextBounds.width,
            height: nextBounds.height,
            opacity: clamp(toFiniteNumber(annotation.opacity, 1), 0.05, 1),
            strokeWidth: Math.max(toFiniteNumber(annotation.strokeWidth, 2), 1),
        };
    }

    const width = clamp(toFiniteNumber(annotation.width, 1), 1, pageSize.width);
    const height = clamp(toFiniteNumber(annotation.height, 1), 1, pageSize.height);

    return {
        ...annotation,
        width,
        height,
        fontSize: Math.max(toFiniteNumber(annotation.fontSize, 18), 1),
        opacity: clamp(toFiniteNumber(annotation.opacity, 1), 0.05, 1),
        strokeWidth: Math.max(toFiniteNumber(annotation.strokeWidth, 2), 1),
        x: clamp(toFiniteNumber(annotation.x, 0), 0, Math.max(pageSize.width - width, 0)),
        y: clamp(toFiniteNumber(annotation.y, 0), 0, Math.max(pageSize.height - height, 0)),
    };
}

function moveAnnotation(annotation: Annotation, dx: number, dy: number, pageSize: PageSize) {
    if ((annotation.type === 'line' || annotation.type === 'pen') && annotation.points?.length) {
        return clampAnnotation({
            ...annotation,
            points: annotation.points.map((point) => ({ x: point.x + dx, y: point.y + dy })),
        }, pageSize);
    }

    return clampAnnotation({
        ...annotation,
        x: annotation.x + dx,
        y: annotation.y + dy,
    }, pageSize);
}

function annotationTitle(annotation: Annotation) {
    if (annotation.type === 'text') return annotation.text.trim() || 'Text';
    if (annotation.type === 'highlight') return 'Highlight';
    if (annotation.type === 'whiteout') return 'Whiteout';
    if (annotation.type === 'line') return 'Line';
    if (annotation.type === 'pen') return 'Pen drawing';
    if (annotation.type === 'image') return annotation.imageName || 'Image';
    return 'Box';
}

function getAnnotationIcon(type: AnnotationType) {
    if (type === 'text') return <Type className="h-4 w-4" />;
    if (type === 'highlight') return <Highlighter className="h-4 w-4" />;
    if (type === 'whiteout') return <Eraser className="h-4 w-4" />;
    if (type === 'line') return <Minus className="h-4 w-4" />;
    if (type === 'pen') return <PenLine className="h-4 w-4" />;
    if (type === 'image') return <ImageIcon className="h-4 w-4" />;
    return <Square className="h-4 w-4" />;
}

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function getImageDimensions(dataUrl: string) {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve({ width: image.naturalWidth || 1, height: image.naturalHeight || 1 });
        image.onerror = () => reject(new Error('Unable to load image'));
        image.src = dataUrl;
    });
}

function isImageMimeTypeSupported(mimeType?: string) {
    return mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/jpg';
}

export default function PDFEditor() {
    const [pdf, setPdf] = useState<PdfState | null>(null);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [activeTool, setActiveTool] = useState<EditorTool>('select');
    const [drafts, setDrafts] = useState<Record<AnnotationType, DraftSettings>>(initialDrafts);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [renderInfos, setRenderInfos] = useState<Record<number, RenderInfo>>({});
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
    const [history, setHistory] = useState<HistoryState>({ past: [], future: [] });
    const [result, setResult] = useState<EditResult | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [resizeTick, setResizeTick] = useState(0);

    const documentViewportRef = useRef<HTMLDivElement>(null);
    const pageFrameRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const pageCanvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
    const thumbnailCanvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

    const selectedAnnotation = useMemo(
        () => annotations.find((annotation) => annotation.id === selectedId) || null,
        [annotations, selectedId]
    );

    const annotationsByPage = useMemo(() => {
        return annotations.reduce<Record<number, Annotation[]>>((acc, annotation) => {
            acc[annotation.page] = [...(acc[annotation.page] || []), annotation];
            return acc;
        }, {});
    }, [annotations]);

    const pageAnnotations = annotationsByPage[currentPage] || [];
    const activeDraft = activeTool === 'select' ? null : drafts[activeTool];

    const clearResult = () => {
        setResult((current) => {
            if (current) URL.revokeObjectURL(current.url);
            return null;
        });
    };

    const pushHistory = (snapshot = annotations) => {
        setHistory((current) => ({
            past: [...current.past.slice(-29), snapshot.map((annotation) => ({ ...annotation, points: annotation.points ? [...annotation.points] : undefined }))],
            future: [],
        }));
    };

    const applyAnnotationChange = (updater: (current: Annotation[]) => Annotation[]) => {
        clearResult();
        setAnnotations((current) => {
            setHistory((historyState) => ({
                past: [...historyState.past.slice(-29), current.map((annotation) => ({ ...annotation, points: annotation.points ? [...annotation.points] : undefined }))],
                future: [],
            }));
            return updater(current);
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
        if (!pdf) {
            setRenderInfos({});
            return;
        }

        let cancelled = false;
        let renderTask: { cancel: () => void; promise: Promise<unknown> } | null = null;

        const renderDocument = async () => {
            setIsRendering(true);

            try {
                const pdfjsLib = await import('pdfjs-dist');
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

                const loadingTask = pdfjsLib.getDocument({ data: pdf.bytes.slice(0) });
                const pdfDoc = await loadingTask.promise;
                const pageNumbers = Array.from({ length: pdf.pageCount }, (_, index) => index + 1);
                const availableWidth = Math.max((documentViewportRef.current?.clientWidth || 920) - 72, 360);
                const maxPageWidth = Math.max(...pdf.pageSizes.map((page) => page.width));
                const fitScale = Math.min(availableWidth / maxPageWidth, 1.45);
                const documentScale = clamp(fitScale * zoom, 0.25, 3);
                const nextInfos: Record<number, RenderInfo> = {};

                const renderCanvas = async (
                    page: Awaited<ReturnType<typeof pdfDoc.getPage>>,
                    canvas: HTMLCanvasElement,
                    scale: number
                ) => {
                    const context = canvas.getContext('2d');
                    if (!context || cancelled) return null;

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

                    return viewport;
                };

                for (const pageNumber of pageNumbers) {
                    if (cancelled) break;

                    const page = await pdfDoc.getPage(pageNumber);
                    const canvas = pageCanvasRefs.current[pageNumber];
                    const thumbnailCanvas = thumbnailCanvasRefs.current[pageNumber];

                    if (canvas) {
                        const viewport = await renderCanvas(page, canvas, documentScale);
                        if (viewport) {
                            nextInfos[pageNumber] = {
                                width: viewport.width,
                                height: viewport.height,
                                scale: documentScale,
                            };
                            setRenderInfos((current) => ({
                                ...current,
                                [pageNumber]: nextInfos[pageNumber],
                            }));
                        }
                    }

                    if (thumbnailCanvas) {
                        const thumbnailScale = Math.min(108 / pdf.pageSizes[pageNumber - 1].width, 0.22);
                        await renderCanvas(page, thumbnailCanvas, thumbnailScale);
                    }
                }

                await pdfDoc.destroy();

                if (!cancelled) {
                    setRenderInfos(nextInfos);
                    setError('');
                }
            } catch (renderError) {
                const name = renderError instanceof Error ? renderError.name : '';
                if (!cancelled && name !== 'RenderingCancelledException') {
                    setError('Unable to render this PDF. Try another PDF or reload the file.');
                }
            } finally {
                if (!cancelled) setIsRendering(false);
            }
        };

        renderDocument();

        return () => {
            cancelled = true;
            renderTask?.cancel();
        };
    }, [pdf, resizeTick, zoom]);

    useEffect(() => {
        if (!dragState || !pdf) return;

        const handlePointerMove = (event: PointerEvent) => {
            const annotationPage = dragState.startAnnotation.page;
            const pageSize = pdf.pageSizes[annotationPage - 1];
            const dx = (event.clientX - dragState.startClientX) / dragState.scale;
            const dy = -(event.clientY - dragState.startClientY) / dragState.scale;

            clearResult();
            setAnnotations((current) =>
                current.map((annotation) => {
                    if (annotation.id !== dragState.id) return annotation;
                    return moveAnnotation(dragState.startAnnotation, dx, dy, pageSize);
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
    }, [dragState, pdf]);

    const getFallbackRenderInfo = useCallback((pageNumber: number): RenderInfo | null => {
        if (!pdf) return null;
        const pageSize = pdf.pageSizes[pageNumber - 1];
        if (!pageSize) return null;
        const scale = clamp(zoom, 0.25, 3);
        return {
            width: pageSize.width * scale,
            height: pageSize.height * scale,
            scale,
        };
    }, [pdf, zoom]);

    const pointerToPdfPoint = useCallback((event: MouseEvent | PointerEvent | React.PointerEvent<HTMLDivElement>, pageNumber: number): PdfPoint | null => {
        if (!pdf) return null;
        const frame = pageFrameRefs.current[pageNumber];
        const renderInfo = renderInfos[pageNumber] || getFallbackRenderInfo(pageNumber);
        const pageSize = pdf.pageSizes[pageNumber - 1];

        if (!frame || !renderInfo || !pageSize) return null;

        const rect = frame.getBoundingClientRect();
        const localX = clamp(event.clientX - rect.left, 0, renderInfo.width);
        const localY = clamp(event.clientY - rect.top, 0, renderInfo.height);

        return {
            x: localX / renderInfo.scale,
            y: pageSize.height - localY / renderInfo.scale,
        };
    }, [getFallbackRenderInfo, pdf, renderInfos]);

    useEffect(() => {
        if (!drawingState || !pdf) return;

        const handlePointerMove = (event: PointerEvent) => {
            const point = pointerToPdfPoint(event, drawingState.page);
            if (!point) return;

            clearResult();
            setAnnotations((current) =>
                current.map((annotation) => {
                    if (annotation.id !== drawingState.id) return annotation;
                    const points = annotation.points || [];
                    const lastPoint = points[points.length - 1];
                    const distance = lastPoint ? Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) : 0;
                    if (distance < 1.5) return annotation;

                    return clampAnnotation({
                        ...annotation,
                        points: [...points, point],
                    }, pdf.pageSizes[drawingState.page - 1]);
                })
            );
        };

        const handlePointerUp = () => {
            setSelectedId(drawingState.id);
            setActiveTool('select');
            setDrawingState(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [drawingState, pdf, pointerToPdfPoint]);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        event.target.value = '';
        clearResult();
        setPdf(null);
        setAnnotations([]);
        setSelectedId(null);
        setCurrentPage(1);
        setZoom(1);
        setRenderInfos({});
        setHistory({ past: [], future: [] });
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

    const handleDocumentScroll = () => {
        const viewport = documentViewportRef.current;
        if (!viewport || !pdf) return;

        const viewportRect = viewport.getBoundingClientRect();
        let nearestPage = currentPage;
        let nearestDistance = Number.POSITIVE_INFINITY;

        for (let pageNumber = 1; pageNumber <= pdf.pageCount; pageNumber += 1) {
            const frame = pageFrameRefs.current[pageNumber];
            if (!frame) continue;

            const rect = frame.getBoundingClientRect();
            if (rect.bottom < viewportRect.top || rect.top > viewportRect.bottom) continue;

            const distance = Math.abs(rect.top - viewportRect.top - 24);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestPage = pageNumber;
            }
        }

        if (nearestPage !== currentPage) setCurrentPage(nearestPage);
    };

    const scrollToPage = (pageNumber: number) => {
        const page = clamp(pageNumber, 1, pdf?.pageCount || 1);
        setCurrentPage(page);
        setSelectedId(null);
        pageFrameRefs.current[page]?.scrollIntoView({ block: 'start', behavior: 'smooth' });
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
        applyAnnotationChange((current) =>
            current.map((annotation) => {
                if (annotation.id !== id) return annotation;
                const pageSize = pdf.pageSizes[annotation.page - 1];
                return clampAnnotation({ ...annotation, ...changes }, pageSize);
            })
        );
    };

    const handleImageDraftChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        event.target.value = '';

        if (!selected || activeTool === 'select') return;

        if (!isImageMimeTypeSupported(selected.type)) {
            setError('Use a PNG or JPG image for PDF image edits.');
            return;
        }

        try {
            const dataUrl = await readFileAsDataUrl(selected);
            const dimensions = await getImageDimensions(dataUrl);
            const aspectRatio = dimensions.width / dimensions.height || 1;
            const width = Math.max(drafts.image.width, 80);
            const height = Math.round(width / aspectRatio);

            setError('');
            setDrafts((current) => ({
                ...current,
                image: {
                    ...current.image,
                    imageDataUrl: dataUrl,
                    imageMimeType: selected.type,
                    imageName: selected.name,
                    imageAspectRatio: aspectRatio,
                    width,
                    height,
                },
            }));
        } catch {
            setError('Unable to load that image. Try a PNG or JPG file.');
        }
    };

    const placeAnnotation = (event: React.PointerEvent<HTMLDivElement>, pageNumber: number) => {
        if (!pdf || activeTool === 'select') return;

        const pageSize = pdf.pageSizes[pageNumber - 1];
        const point = pointerToPdfPoint(event, pageNumber);
        const draft = drafts[activeTool];

        if (!point || !pageSize) return;

        if (activeTool === 'text' && !draft.text.trim()) {
            setError('Enter text before placing a text edit.');
            return;
        }

        if (activeTool === 'image' && !draft.imageDataUrl) {
            setError('Choose a PNG or JPG image before placing an image edit.');
            return;
        }

        pushHistory();
        clearResult();
        setError('');

        if (activeTool === 'pen') {
            const annotation = clampAnnotation({
                id: createId(),
                type: 'pen',
                page: pageNumber,
                text: '',
                x: point.x,
                y: point.y,
                width: 1,
                height: 1,
                fontSize: draft.fontSize,
                color: draft.color,
                opacity: draft.opacity,
                strokeWidth: draft.strokeWidth,
                points: [point],
            }, pageSize);

            setAnnotations((current) => [...current, annotation]);
            setSelectedId(annotation.id);
            setDrawingState({ id: annotation.id, page: pageNumber });
            return;
        }

        const width = Math.min(Math.max(draft.width, 1), pageSize.width);
        const defaultHeight = activeTool === 'text'
            ? Math.max(draft.height, getTextHeight(draft.fontSize, draft.text))
            : draft.height;
        const height = Math.min(Math.max(defaultHeight, 1), pageSize.height);
        const startY = point.y - height;

        let annotation: Annotation = {
            id: createId(),
            type: activeTool,
            page: pageNumber,
            text: draft.text,
            x: point.x,
            y: startY,
            width,
            height,
            fontSize: draft.fontSize,
            color: activeTool === 'whiteout' ? '#ffffff' : draft.color,
            opacity: activeTool === 'whiteout' ? 1 : draft.opacity,
            strokeWidth: draft.strokeWidth,
            imageDataUrl: draft.imageDataUrl,
            imageMimeType: draft.imageMimeType,
            imageName: draft.imageName,
        };

        if (activeTool === 'line') {
            const end = {
                x: clamp(point.x + width, 0, pageSize.width),
                y: point.y,
            };
            annotation = {
                ...annotation,
                y: point.y,
                height: 1,
                points: [point, end],
            };
        }

        const nextAnnotation = clampAnnotation(annotation, pageSize);
        setAnnotations((current) => [...current, nextAnnotation]);
        setSelectedId(nextAnnotation.id);
        setCurrentPage(pageNumber);
        setActiveTool('select');
    };

    const startDrag = (event: React.PointerEvent<HTMLButtonElement>, annotation: Annotation) => {
        event.stopPropagation();
        const renderInfo = renderInfos[annotation.page] || getFallbackRenderInfo(annotation.page);
        if (!renderInfo) return;

        pushHistory();
        setActiveTool('select');
        setSelectedId(annotation.id);
        setCurrentPage(annotation.page);
        setDragState({
            id: annotation.id,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startAnnotation: annotation,
            scale: renderInfo.scale,
        });
    };

    const removeAnnotation = (id: string) => {
        applyAnnotationChange((current) => current.filter((annotation) => annotation.id !== id));
        setSelectedId((current) => (current === id ? null : current));
    };

    const clearPageAnnotations = () => {
        applyAnnotationChange((current) => current.filter((annotation) => annotation.page !== currentPage));
        setSelectedId(null);
    };

    const duplicateSelected = () => {
        if (!selectedAnnotation || !pdf) return;

        applyAnnotationChange((current) => {
            const pageSize = pdf.pageSizes[selectedAnnotation.page - 1];
            const duplicate = moveAnnotation({
                ...selectedAnnotation,
                id: createId(),
                points: selectedAnnotation.points ? selectedAnnotation.points.map((point) => ({ ...point })) : undefined,
            }, 16, -16, pageSize);

            setSelectedId(duplicate.id);
            return [...current, duplicate];
        });
    };

    const clearAll = () => {
        clearResult();
        setPdf(null);
        setAnnotations([]);
        setSelectedId(null);
        setCurrentPage(1);
        setZoom(1);
        setRenderInfos({});
        setHistory({ past: [], future: [] });
        setError('');
    };

    const undo = () => {
        clearResult();
        setHistory((current) => {
            if (current.past.length === 0) return current;
            const previous = current.past[current.past.length - 1];
            setAnnotations(previous);
            setSelectedId(null);
            return {
                past: current.past.slice(0, -1),
                future: [annotations, ...current.future].slice(0, 30),
            };
        });
    };

    const redo = () => {
        clearResult();
        setHistory((current) => {
            if (current.future.length === 0) return current;
            const next = current.future[0];
            setAnnotations(next);
            setSelectedId(null);
            return {
                past: [...current.past, annotations].slice(-30),
                future: current.future.slice(1),
            };
        });
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

            for (const annotation of annotations) {
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
                    continue;
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
                    continue;
                }

                if (annotation.type === 'image' && annotation.imageDataUrl) {
                    const bytes = await fetch(annotation.imageDataUrl).then((response) => response.arrayBuffer());
                    const embeddedImage = annotation.imageMimeType === 'image/jpeg' || annotation.imageMimeType === 'image/jpg'
                        ? await doc.embedJpg(bytes)
                        : await doc.embedPng(bytes);

                    page.drawImage(embeddedImage, {
                        x: annotation.x,
                        y: annotation.y,
                        width: annotation.width,
                        height: annotation.height,
                        opacity,
                    });
                    continue;
                }

                const { r, g, b } = hexToRgb(annotation.color);
                const color = rgb(r, g, b);

                if ((annotation.type === 'line' || annotation.type === 'pen') && annotation.points?.length) {
                    const points = annotation.points;
                    const drawablePoints = points.length === 1 ? [points[0], { x: points[0].x + 0.1, y: points[0].y + 0.1 }] : points;

                    for (let index = 1; index < drawablePoints.length; index += 1) {
                        page.drawLine({
                            start: drawablePoints[index - 1],
                            end: drawablePoints[index],
                            color,
                            thickness: annotation.strokeWidth,
                            opacity,
                        });
                    }
                    continue;
                }

                page.drawRectangle({
                    x: annotation.x,
                    y: annotation.y,
                    width: annotation.width,
                    height: annotation.height,
                    color: annotation.type === 'highlight' ? color : undefined,
                    borderColor: annotation.type === 'rectangle' ? color : undefined,
                    borderWidth: annotation.type === 'rectangle' ? annotation.strokeWidth : 0,
                    opacity,
                });
            }

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

    const renderAnnotationOverlay = (annotation: Annotation, pageSize: PageSize, renderInfo: RenderInfo) => {
        const isSelected = annotation.id === selectedId;
        const bounds = getAnnotationBounds(annotation);
        const isPath = annotation.type === 'line' || annotation.type === 'pen';
        const pad = isPath ? 8 : 0;
        const left = bounds.x * renderInfo.scale - pad;
        const top = (pageSize.height - bounds.y - bounds.height) * renderInfo.scale - pad;
        const width = Math.max(bounds.width * renderInfo.scale + pad * 2, isPath ? 18 : 8);
        const height = Math.max(bounds.height * renderInfo.scale + pad * 2, isPath ? 18 : 8);
        const commonStyle = { left, top, width, height };

        if (isPath && annotation.points?.length) {
            const maxY = bounds.y + bounds.height;
            const points = annotation.points
                .map((point) => `${(point.x - bounds.x) * renderInfo.scale + pad},${(maxY - point.y) * renderInfo.scale + pad}`)
                .join(' ');

            return (
                <button
                    key={annotation.id}
                    type="button"
                    onPointerDown={(event) => startDrag(event, annotation)}
                    onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(annotation.id);
                        setActiveTool('select');
                        setCurrentPage(annotation.page);
                    }}
                    className={cn(
                        'absolute rounded-sm text-left transition-shadow',
                        isSelected && 'shadow-[0_0_0_2px_rgba(37,99,235,0.9)]'
                    )}
                    style={commonStyle}
                    title={annotationTitle(annotation)}
                >
                    <svg width="100%" height="100%" className="overflow-visible">
                        <polyline
                            points={points}
                            fill="none"
                            stroke={annotation.color}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeOpacity={annotation.opacity}
                            strokeWidth={Math.max(annotation.strokeWidth * renderInfo.scale, 2)}
                        />
                    </svg>
                </button>
            );
        }

        const shapeStyle = annotation.type === 'highlight'
            ? {
                backgroundColor: hexToRgba(annotation.color, annotation.opacity),
                borderColor: isSelected ? '#2563eb' : hexToRgba(annotation.color, 0.7),
            }
            : annotation.type === 'rectangle'
                ? {
                    backgroundColor: 'transparent',
                    borderColor: annotation.color,
                    borderWidth: Math.max(annotation.strokeWidth * renderInfo.scale, 1),
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
                    setCurrentPage(annotation.page);
                }}
                className={cn(
                    'absolute overflow-hidden rounded-sm text-left transition-shadow',
                    isSelected && 'shadow-[0_0_0_2px_rgba(37,99,235,0.9)]',
                    annotation.type === 'text' && 'border border-dashed border-primary/60 bg-primary/5 px-1',
                    annotation.type === 'highlight' && 'border-2',
                    annotation.type === 'rectangle' && 'border-2',
                    annotation.type === 'whiteout' && 'border border-dashed',
                    annotation.type === 'image' && 'border border-dashed border-primary/60 bg-muted/10'
                )}
                style={{
                    ...commonStyle,
                    ...shapeStyle,
                    color: annotation.color,
                    fontSize: annotation.fontSize * renderInfo.scale,
                    lineHeight: 1.25,
                    opacity: annotation.type === 'text' || annotation.type === 'image' ? annotation.opacity : 1,
                    whiteSpace: 'pre-wrap',
                }}
                title={annotationTitle(annotation)}
            >
                {annotation.type === 'text' ? annotation.text : null}
                {annotation.type === 'image' && annotation.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={annotation.imageDataUrl} alt="" className="h-full w-full object-fill" />
                ) : null}
            </button>
        );
    };

    return (
        <ToolLayout
            title="PDF Editor"
            description="Edit PDF pages in a scrollable workspace with text, drawings, images, highlights, boxes, and whiteout"
            category="pdf"
        >
            <div className="mx-auto max-w-[1600px] space-y-6">
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
                    title="PDF workspace"
                    description={pdf ? 'Scroll the full document, use thumbnails to jump pages, and edit with the toolbar.' : 'Upload a PDF to open the full editor workspace.'}
                    className="overflow-hidden"
                >
                    {!pdf ? (
                        <ToolEmptyState
                            icon={<FileText className="h-8 w-8" />}
                            title="No PDF loaded"
                            description="Choose a PDF above to open it in the full-page editor."
                        />
                    ) : (
                        <div className="grid h-[78vh] min-h-[680px] overflow-hidden rounded-lg border bg-background xl:grid-cols-[136px_minmax(0,1fr)_340px]">
                            <aside className="hidden overflow-auto border-r bg-muted/20 p-3 xl:block">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Layers className="h-4 w-4" />
                                    Pages
                                </div>
                                <div className="space-y-3">
                                    {Array.from({ length: pdf.pageCount }, (_, index) => {
                                        const pageNumber = index + 1;
                                        const editCount = annotationsByPage[pageNumber]?.length || 0;

                                        return (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() => scrollToPage(pageNumber)}
                                                className={cn(
                                                    'w-full rounded-md border bg-background p-2 text-left transition-colors hover:bg-accent',
                                                    currentPage === pageNumber && 'border-primary shadow-sm'
                                                )}
                                            >
                                                <canvas
                                                    ref={(node) => {
                                                        thumbnailCanvasRefs.current[pageNumber] = node;
                                                    }}
                                                    className="mx-auto rounded border bg-white"
                                                />
                                                <div className="mt-2 flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground">Page {pageNumber}</span>
                                                    {editCount > 0 && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">{editCount}</span>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </aside>

                            <div className="flex min-w-0 flex-col">
                                <div className="sticky top-0 z-20 border-b bg-card/95 px-3 py-2 backdrop-blur">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <ToolActionBar>
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
                                                        className={cn(
                                                            'inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
                                                            isActive
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                        )}
                                                        title={option.label}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        <span className="hidden 2xl:inline">{option.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </ToolActionBar>

                                        <ToolActionBar>
                                            <button
                                                type="button"
                                                onClick={undo}
                                                disabled={history.past.length === 0}
                                                className="btn btn-secondary h-9 w-9 p-0"
                                                title="Undo"
                                                aria-label="Undo"
                                            >
                                                <Undo2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={redo}
                                                disabled={history.future.length === 0}
                                                className="btn btn-secondary h-9 w-9 p-0"
                                                title="Redo"
                                                aria-label="Redo"
                                            >
                                                <Redo2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={duplicateSelected}
                                                disabled={!selectedAnnotation}
                                                className="btn btn-secondary h-9 w-9 p-0"
                                                title="Duplicate selected"
                                                aria-label="Duplicate selected"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => selectedAnnotation && removeAnnotation(selectedAnnotation.id)}
                                                disabled={!selectedAnnotation}
                                                className="btn btn-secondary h-9 w-9 p-0"
                                                title="Delete selected"
                                                aria-label="Delete selected"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </ToolActionBar>

                                        <ToolActionBar>
                                            <ToolField label="Page" htmlFor="pdf-editor-page" className="w-24">
                                                <input
                                                    id="pdf-editor-page"
                                                    type="number"
                                                    min="1"
                                                    max={pdf.pageCount}
                                                    value={currentPage}
                                                    onChange={(event) => scrollToPage(Number(event.target.value) || 1)}
                                                    className="input h-9"
                                                />
                                            </ToolField>
                                            <button
                                                type="button"
                                                onClick={() => setZoom((value) => clamp(Number((value - 0.1).toFixed(2)), 0.5, 2.25))}
                                                disabled={zoom <= 0.5}
                                                className="btn btn-secondary h-9 w-9 p-0"
                                                title="Zoom out"
                                                aria-label="Zoom out"
                                            >
                                                <ZoomOut className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setZoom(1)}
                                                disabled={zoom === 1}
                                                className="btn btn-secondary h-9 gap-2 px-3"
                                            >
                                                <Maximize2 className="h-4 w-4" />
                                                Fit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setZoom((value) => clamp(Number((value + 0.1).toFixed(2)), 0.5, 2.25))}
                                                disabled={zoom >= 2.25}
                                                className="btn btn-secondary h-9 w-9 p-0"
                                                title="Zoom in"
                                                aria-label="Zoom in"
                                            >
                                                <ZoomIn className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={applyEdits}
                                                disabled={annotations.length === 0 || isProcessing}
                                                className="btn btn-primary h-9 gap-2 px-3"
                                            >
                                                <Download className="h-4 w-4" />
                                                {isProcessing ? 'Exporting' : 'Export'}
                                            </button>
                                        </ToolActionBar>
                                    </div>
                                </div>

                                <div
                                    ref={documentViewportRef}
                                    onScroll={handleDocumentScroll}
                                    className="flex-1 overflow-auto bg-muted/30 px-4 py-6 sm:px-8"
                                >
                                    <div className="mx-auto flex w-max min-w-full flex-col items-center gap-8">
                                        {Array.from({ length: pdf.pageCount }, (_, index) => {
                                            const pageNumber = index + 1;
                                            const pageSize = pdf.pageSizes[index];
                                            const renderInfo = renderInfos[pageNumber] || getFallbackRenderInfo(pageNumber);
                                            const pageWidth = renderInfo?.width || pageSize.width;
                                            const pageHeight = renderInfo?.height || pageSize.height;

                                            return (
                                                <div key={pageNumber} className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>Page {pageNumber}</span>
                                                        <span>{Math.round(pageSize.width)} x {Math.round(pageSize.height)} pt</span>
                                                    </div>
                                                    <div
                                                        ref={(node) => {
                                                            pageFrameRefs.current[pageNumber] = node;
                                                        }}
                                                        onPointerDown={(event) => placeAnnotation(event, pageNumber)}
                                                        className={cn(
                                                            'relative bg-white shadow-xl ring-1 ring-border',
                                                            activeTool !== 'select' && 'cursor-crosshair'
                                                        )}
                                                        style={{
                                                            width: pageWidth,
                                                            height: pageHeight,
                                                        }}
                                                    >
                                                        <canvas
                                                            ref={(node) => {
                                                                pageCanvasRefs.current[pageNumber] = node;
                                                            }}
                                                            className="block"
                                                        />
                                                        {renderInfo && (annotationsByPage[pageNumber] || []).map((annotation) =>
                                                            renderAnnotationOverlay(annotation, pageSize, renderInfo)
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <aside className="overflow-auto border-l bg-card p-4">
                                <div className="mb-4 flex items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">Properties</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">Page {currentPage} edits and selected object settings.</p>
                                    </div>
                                    <button type="button" onClick={clearAll} className="btn btn-secondary h-9 w-9 p-0" title="Reset editor" aria-label="Reset editor">
                                        <RotateCcw className="h-4 w-4" />
                                    </button>
                                </div>

                                {isRendering && <ToolStatus tone="info" className="mb-4">Rendering document pages</ToolStatus>}

                                {selectedAnnotation ? (
                                    <div className="space-y-4">
                                        <div className="rounded-md border bg-muted/20 p-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                {getAnnotationIcon(selectedAnnotation.type)}
                                                {annotationTitle(selectedAnnotation)}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Page {selectedAnnotation.page}, x {Math.round(getAnnotationBounds(selectedAnnotation).x)}, y {Math.round(getAnnotationBounds(selectedAnnotation).y)}
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

                                        {selectedAnnotation.type !== 'line' && selectedAnnotation.type !== 'pen' && (
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
                                        )}

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

                                        {(selectedAnnotation.type === 'line' || selectedAnnotation.type === 'pen' || selectedAnnotation.type === 'rectangle') && (
                                            <ToolField label="Stroke width" htmlFor="selected-pdf-stroke">
                                                <input
                                                    id="selected-pdf-stroke"
                                                    type="number"
                                                    min="1"
                                                    value={selectedAnnotation.strokeWidth}
                                                    onChange={(event) => updateAnnotation(selectedAnnotation.id, { strokeWidth: Number(event.target.value) || 1 })}
                                                    className="input h-10"
                                                />
                                            </ToolField>
                                        )}

                                        {selectedAnnotation.type !== 'whiteout' && selectedAnnotation.type !== 'image' && (
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
                                            <ToolField label={`Opacity ${Math.round(selectedAnnotation.opacity * 100)}%`} htmlFor="selected-pdf-opacity">
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
                                            <button type="button" onClick={duplicateSelected} className="btn btn-secondary gap-2">
                                                <Copy className="h-4 w-4" />
                                                Duplicate
                                            </button>
                                            <button type="button" onClick={() => removeAnnotation(selectedAnnotation.id)} className="btn btn-secondary gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </ToolActionBar>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeTool === 'select' ? (
                                            <ToolStatus tone="info">
                                                Select an edit on the document to move, duplicate, recolor, resize, or delete it.
                                            </ToolStatus>
                                        ) : (
                                            <>
                                                <ToolStatus tone="info">
                                                    {activeTool === 'pen'
                                                        ? 'Drag on any page to draw a pen stroke.'
                                                        : `Click any page to place the ${activeTool} edit.`}
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

                                                {activeTool === 'image' && (
                                                    <ToolField label="Image" htmlFor="new-pdf-image">
                                                        <input
                                                            id="new-pdf-image"
                                                            type="file"
                                                            accept="image/png,image/jpeg"
                                                            onChange={handleImageDraftChange}
                                                            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                                                        />
                                                        {drafts.image.imageDataUrl && (
                                                            <div className="mt-3 rounded-md border bg-muted/20 p-2">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={drafts.image.imageDataUrl} alt="" className="max-h-28 w-full object-contain" />
                                                                <p className="mt-2 truncate text-xs text-muted-foreground">{drafts.image.imageName}</p>
                                                            </div>
                                                        )}
                                                    </ToolField>
                                                )}

                                                {activeDraft && activeTool !== 'pen' && activeTool !== 'line' && (
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

                                                {activeTool === 'line' && activeDraft && (
                                                    <ToolField label="Line length" htmlFor="new-pdf-line-length">
                                                        <input
                                                            id="new-pdf-line-length"
                                                            type="number"
                                                            min="1"
                                                            value={activeDraft.width}
                                                            onChange={(event) => updateDraft({ width: Number(event.target.value) || 1 })}
                                                            className="input h-10"
                                                        />
                                                    </ToolField>
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

                                                {(activeTool === 'line' || activeTool === 'pen' || activeTool === 'rectangle') && activeDraft && (
                                                    <ToolField label="Stroke width" htmlFor="new-pdf-stroke">
                                                        <input
                                                            id="new-pdf-stroke"
                                                            type="number"
                                                            min="1"
                                                            value={activeDraft.strokeWidth}
                                                            onChange={(event) => updateDraft({ strokeWidth: Number(event.target.value) || 1 })}
                                                            className="input h-10"
                                                        />
                                                    </ToolField>
                                                )}

                                                {activeTool !== 'whiteout' && activeTool !== 'image' && activeDraft && (
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
                                                    <ToolField label={`Opacity ${Math.round(activeDraft.opacity * 100)}%`} htmlFor="new-pdf-opacity">
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

                                <div className="mt-6 rounded-md border bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Layers className="h-4 w-4" />
                                        Page edits
                                    </div>
                                    {pageAnnotations.length === 0 ? (
                                        <p className="mt-2 text-sm text-muted-foreground">No edits on this page yet.</p>
                                    ) : (
                                        <div className="mt-3 space-y-2">
                                            {pageAnnotations.map((annotation, index) => (
                                                <button
                                                    key={annotation.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedId(annotation.id);
                                                        setActiveTool('select');
                                                        setCurrentPage(annotation.page);
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
                    )}
                </ToolPanel>

                <ToolPanel title="Edited PDF" description={result ? 'Your edited PDF is ready.' : 'Output will appear after exporting edits.'}>
                    {!result ? (
                        <ToolEmptyState title="No edited file yet" description="Place edits in the workspace, then export to create a downloadable PDF." />
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
                    This editor adds and exports editable overlays. Whiteout covers page content visually, but it is not secure redaction for sensitive information.
                </ToolStatus>
            </div>
        </ToolLayout>
    );
}
