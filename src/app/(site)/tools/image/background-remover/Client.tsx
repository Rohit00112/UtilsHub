'use client';

import { useCallback, useRef, useState } from 'react';
import {
    Download,
    ImageIcon,
    Loader2,
    RotateCcw,
    Sparkles,
    Upload,
} from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolPanel,
    ToolStatus,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

/* ── Processing states ──────────────────────────────────────── */
type ProcessingState = 'idle' | 'loading-model' | 'processing' | 'done' | 'error';

const progressLabels: Record<ProcessingState, string> = {
    idle: '',
    'loading-model': 'Downloading AI model (first time only, ~40 MB)…',
    processing: 'Removing background…',
    done: 'Background removed!',
    error: 'Something went wrong.',
};

/* ── Checkerboard CSS for transparent previews ──────────────── */
const checkerboardBg = 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)';

export default function BackgroundRemover() {
    const [fileName, setFileName] = useToolState('bg-remover', 'fileName', '');
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [state, setState] = useState<ProcessingState>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [progress, setProgress] = useState(0);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [useBgColor, setUseBgColor] = useState(false);
    const [compareMode, setCompareMode] = useState(true);
    const originalFileRef = useRef<File | null>(null);

    const cleanup = useCallback(() => {
        if (originalUrl) URL.revokeObjectURL(originalUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
    }, [originalUrl, resultUrl]);

    const handleFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        cleanup();

        setFileName(file.name);
        setOriginalUrl(URL.createObjectURL(file));
        setResultUrl(null);
        setErrorMsg('');
        setState('idle');
        setProgress(0);
        originalFileRef.current = file;
    }, [cleanup, setFileName]);

    const processImage = useCallback(async () => {
        const file = originalFileRef.current;
        if (!file) return;

        try {
            setState('loading-model');
            setProgress(10);

            // Dynamic import to avoid loading the heavy module until needed
            const { removeBackground } = await import('@imgly/background-removal');
            
            setState('processing');
            setProgress(40);

            const blob = await removeBackground(file, {
                progress: (key: string, current: number, total: number) => {
                    if (key === 'compute:inference') {
                        setProgress(40 + Math.round((current / total) * 50));
                    }
                },
            });

            let finalBlob = blob;

            // If user wants a colored background, composite the result onto it
            if (useBgColor) {
                const bitmap = await createImageBitmap(blob);
                const canvas = document.createElement('canvas');
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(bitmap, 0, 0);
                    bitmap.close();
                    finalBlob = await new Promise<Blob>((resolve) => {
                        canvas.toBlob((b) => resolve(b!), 'image/png');
                    });
                }
            }

            const url = URL.createObjectURL(finalBlob);
            setResultUrl(url);
            setProgress(100);
            setState('done');
        } catch (err) {
            console.error('Background removal error:', err);
            setErrorMsg(err instanceof Error ? err.message : 'Failed to process the image. Try a different file.');
            setState('error');
        }
    }, [bgColor, useBgColor]);

    const downloadResult = useCallback(() => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        const baseName = fileName.replace(/\.[^.]+$/, '') || 'image';
        link.download = `${baseName}-no-bg.png`;
        link.click();
    }, [resultUrl, fileName]);

    const reset = useCallback(() => {
        cleanup();
        setFileName('');
        setOriginalUrl(null);
        setResultUrl(null);
        setState('idle');
        setProgress(0);
        setErrorMsg('');
        originalFileRef.current = null;
    }, [cleanup, setFileName]);

    return (
        <ToolLayout
            title="Background Remover"
            description="Remove backgrounds from images using AI — entirely in your browser, no uploads"
            category="image"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolStatus tone="info">
                    Background removal uses a ~40 MB AI model that downloads once and runs entirely in your browser. Your images are never uploaded to a server.
                </ToolStatus>

                {/* Upload */}
                <ToolPanel title="Image" description="Upload a photo to remove its background.">
                    <ToolUploadZone
                        title={fileName || 'Choose an image'}
                        description="PNG, JPEG, and WebP are supported"
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'image/png,image/jpeg,image/webp', onChange: handleFile }}
                    />
                </ToolPanel>

                {/* Controls */}
                {originalUrl && (
                    <ToolPanel title="Options">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <ToolField label="Replace background with color">
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useBgColor}
                                            onChange={(e) => setUseBgColor(e.target.checked)}
                                            className="h-4 w-4 rounded border-input accent-primary"
                                        />
                                        Use color
                                    </label>
                                    {useBgColor && (
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="h-9 w-16 cursor-pointer rounded-md border border-input bg-background p-1"
                                        />
                                    )}
                                </div>
                            </ToolField>

                            <ToolActionBar className="sm:ml-auto">
                                <button
                                    type="button"
                                    onClick={processImage}
                                    disabled={state === 'loading-model' || state === 'processing'}
                                    className="btn btn-primary gap-2 h-10 px-5"
                                >
                                    {state === 'loading-model' || state === 'processing' ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-4 w-4" />
                                    )}
                                    {state === 'loading-model' ? 'Loading model…' : state === 'processing' ? 'Processing…' : 'Remove background'}
                                </button>
                                <button type="button" onClick={reset} className="btn btn-secondary gap-2 h-10">
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </button>
                            </ToolActionBar>
                        </div>

                        {/* Progress bar */}
                        {(state === 'loading-model' || state === 'processing') && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{progressLabels[state]}</span>
                                    <span className="tabular-nums">{progress}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </ToolPanel>
                )}

                {/* Error */}
                {state === 'error' && errorMsg && (
                    <ToolStatus tone="error">{errorMsg}</ToolStatus>
                )}

                {/* Success + download */}
                {state === 'done' && resultUrl && (
                    <ToolPanel title="Result">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <ToolStatus tone="success">Background removed successfully!</ToolStatus>
                            <ToolActionBar>
                                <button
                                    type="button"
                                    onClick={() => setCompareMode(!compareMode)}
                                    className="btn btn-secondary gap-2 h-9"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                    {compareMode ? 'Result only' : 'Compare'}
                                </button>
                                <button
                                    type="button"
                                    onClick={downloadResult}
                                    className="btn btn-primary gap-2 h-9 px-5"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PNG
                                </button>
                            </ToolActionBar>
                        </div>
                    </ToolPanel>
                )}

                {/* Preview */}
                {originalUrl && (
                    <div className={`grid gap-4 ${compareMode && resultUrl ? 'md:grid-cols-2' : ''}`}>
                        {/* Original */}
                        {(compareMode || !resultUrl) && (
                            <ToolPanel title="Original">
                                <div className="overflow-auto rounded-xl border p-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={originalUrl}
                                        alt="Original"
                                        className="mx-auto block max-h-[500px] max-w-full rounded-lg object-contain"
                                    />
                                </div>
                            </ToolPanel>
                        )}

                        {/* Result */}
                        {resultUrl && (
                            <ToolPanel title={useBgColor ? 'With new background' : 'Background removed'}>
                                <div
                                    className="overflow-auto rounded-xl border p-3"
                                    style={!useBgColor ? {
                                        backgroundImage: checkerboardBg,
                                        backgroundSize: '20px 20px',
                                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                    } : undefined}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={resultUrl}
                                        alt="Result with background removed"
                                        className="mx-auto block max-h-[500px] max-w-full rounded-lg object-contain"
                                    />
                                </div>
                            </ToolPanel>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
