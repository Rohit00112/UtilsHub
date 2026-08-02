'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Eraser, RotateCcw, Undo2, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolPanel,
    ToolStatus,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';
import {
    fillSelectionFromEdges,
    normalizeImageRect,
    type ImageRect,
} from '@/lib/image-processing';

const emptySelection: ImageRect = { x: 0, y: 0, width: 1, height: 1 };

export default function WatermarkRemover() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const originalRef = useRef<ImageData | null>(null);
    const undoRef = useRef<ImageData | null>(null);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const [fileName, setFileName] = useToolState('watermark-remover', 'fileName', '');
    const [selection, setSelection] = useToolState<ImageRect>('watermark-remover', 'selection', emptySelection);
    const [hasImage, setHasImage] = useToolState('watermark-remover', 'hasImage', false);
    const [message, setMessage] = useState('');
    const [hasUndo, setHasUndo] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const overlay = overlayRef.current;
        if (!canvas || !overlay || !hasImage) return;
        overlay.width = canvas.width;
        overlay.height = canvas.height;
        const context = overlay.getContext('2d');
        if (!context) return;

        const rect = normalizeImageRect(selection, canvas.width, canvas.height);
        context.clearRect(0, 0, overlay.width, overlay.height);
        context.fillStyle = 'rgba(15, 23, 42, 0.34)';
        context.fillRect(0, 0, overlay.width, overlay.height);
        context.clearRect(rect.x, rect.y, rect.width, rect.height);
        context.strokeStyle = '#22c55e';
        context.lineWidth = Math.max(2, Math.round(canvas.width / 500));
        context.setLineDash([10, 7]);
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }, [hasImage, selection]);

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setMessage('');

        try {
            const bitmap = await createImageBitmap(file);
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) throw new Error('Canvas rendering is not available in this browser.');
            context.drawImage(bitmap, 0, 0);
            bitmap.close();
            originalRef.current = context.getImageData(0, 0, canvas.width, canvas.height);
            undoRef.current = null;
            setHasUndo(false);
            setFileName(file.name);
            setSelection({
                x: Math.round(canvas.width * 0.64),
                y: Math.round(canvas.height * 0.78),
                width: Math.max(1, Math.round(canvas.width * 0.3)),
                height: Math.max(1, Math.round(canvas.height * 0.14)),
            });
            setHasImage(true);
        } catch {
            setMessage('Unable to read that image. Try a PNG, JPEG, or WebP file.');
        }
    };

    const pointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const overlay = overlayRef.current;
        if (!overlay) return { x: 0, y: 0 };
        const bounds = overlay.getBoundingClientRect();
        return {
            x: Math.round((event.clientX - bounds.left) * (overlay.width / bounds.width)),
            y: Math.round((event.clientY - bounds.top) * (overlay.height / bounds.height)),
        };
    };

    const startSelection = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!hasImage) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const point = pointerPosition(event);
        dragStartRef.current = point;
        setSelection({ ...point, width: 1, height: 1 });
    };

    const moveSelection = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const start = dragStartRef.current;
        if (!start) return;
        const point = pointerPosition(event);
        setSelection({ x: start.x, y: start.y, width: point.x - start.x, height: point.y - start.y });
    };

    const finishSelection = () => {
        const canvas = canvasRef.current;
        if (canvas && dragStartRef.current) {
            setSelection((current) => normalizeImageRect(current, canvas.width, canvas.height));
        }
        dragStartRef.current = null;
    };

    const removeSelection = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d', { willReadFrequently: true });
        if (!canvas || !context) return;
        const current = context.getImageData(0, 0, canvas.width, canvas.height);
        undoRef.current = current;
        const pixels = fillSelectionFromEdges(current.data, canvas.width, canvas.height, selection);
        context.putImageData(new ImageData(pixels, canvas.width, canvas.height), 0, 0);
        setHasUndo(true);
        setMessage('Selection cleaned. Small marks on simple backgrounds give the best result.');
    };

    const undo = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!context || !undoRef.current) return;
        context.putImageData(undoRef.current, 0, 0);
        undoRef.current = null;
        setHasUndo(false);
        setMessage('Last cleanup undone.');
    };

    const reset = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!context || !originalRef.current) return;
        context.putImageData(originalRef.current, 0, 0);
        undoRef.current = null;
        setHasUndo(false);
        setMessage('Original image restored.');
    };

    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (!blob) return;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName.replace(/\.[^.]+$/, '') || 'cleaned-image'}-cleaned.png`;
            link.click();
            URL.revokeObjectURL(link.href);
        }, 'image/png');
    };

    const updateSelection = (key: keyof ImageRect, value: string) => {
        setSelection((current) => ({ ...current, [key]: Number(value) || 0 }));
    };

    return (
        <ToolLayout
            title="Watermark Remover"
            description="Clean a selected watermark or unwanted mark from an image you own"
            category="image"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolStatus tone="warning">
                    Only remove marks from images you own or have permission to edit. This local cleanup works best on small marks over simple backgrounds.
                </ToolStatus>

                <ToolPanel title="Image">
                    <ToolUploadZone
                        title={fileName || 'Choose an image'}
                        description="PNG, JPEG, and WebP are supported"
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'image/*', onChange: handleFile }}
                    />
                </ToolPanel>

                {hasImage && (
                    <ToolPanel
                        title="Select the mark"
                        description="Drag over the full watermark with a little padding, or enter exact pixel values."
                    >
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {(['x', 'y', 'width', 'height'] as const).map((key) => (
                                    <ToolField key={key} label={key === 'x' || key === 'y' ? key.toUpperCase() : `${key[0].toUpperCase()}${key.slice(1)}`}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={Math.round(selection[key])}
                                            onChange={(event) => updateSelection(key, event.target.value)}
                                            className="input h-10"
                                        />
                                    </ToolField>
                                ))}
                            </div>
                            <ToolActionBar className="mt-4">
                                <button type="button" onClick={removeSelection} className="btn btn-primary gap-2">
                                    <Eraser className="h-4 w-4" />
                                    Remove selection
                                </button>
                                <button type="button" onClick={undo} disabled={!hasUndo} className="btn btn-secondary gap-2">
                                    <Undo2 className="h-4 w-4" />
                                    Undo
                                </button>
                                <button type="button" onClick={reset} className="btn btn-secondary gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </button>
                                <button type="button" onClick={download} className="btn btn-secondary gap-2">
                                    <Download className="h-4 w-4" />
                                    Download PNG
                                </button>
                            </ToolActionBar>
                            {message && <ToolStatus tone={message.includes('Unable') ? 'error' : 'success'} className="mt-4">{message}</ToolStatus>}
                    </ToolPanel>
                )}

                <div className={hasImage ? '' : 'hidden'}>
                    <ToolPanel title="Preview">
                        <div className="overflow-auto rounded-xl border bg-[linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[length:20px_20px] p-3">
                            <div className="relative mx-auto w-fit max-w-full touch-none">
                                <canvas ref={canvasRef} className="block h-auto max-w-full" />
                                <canvas
                                    ref={overlayRef}
                                    onPointerDown={startSelection}
                                    onPointerMove={moveSelection}
                                    onPointerUp={finishSelection}
                                    onPointerCancel={finishSelection}
                                    className="absolute inset-0 h-full w-full cursor-crosshair"
                                    aria-label="Drag to select the watermark area"
                                />
                            </div>
                        </div>
                    </ToolPanel>
                </div>

                {!hasImage && message && <ToolStatus tone="error">{message}</ToolStatus>}
            </div>
        </ToolLayout>
    );
}
