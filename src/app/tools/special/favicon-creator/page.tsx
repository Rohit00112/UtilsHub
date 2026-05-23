'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, ImageIcon, Info, Package, Trash2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolEmptyState,
    ToolPanel,
    ToolResultCard,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';

const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];

export default function FaviconCreator() {
    const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
    const [sourceName, setSourceName] = useState('');
    const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new window.Image();
            img.onload = () => {
                setSourceImage(img);
                setSourceName(file.name);
            };
            img.src = readerEvent.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const generateFavicons = useCallback((img: HTMLImageElement) => {
        FAVICON_SIZES.forEach((size) => {
            const canvas = canvasRefs.current[size];
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = size;
            canvas.height = size;
            ctx.clearRect(0, 0, size, size);

            const aspectRatio = img.width / img.height;
            let drawWidth = size;
            let drawHeight = size;
            let offsetX = 0;
            let offsetY = 0;

            if (aspectRatio > 1) {
                drawHeight = size / aspectRatio;
                offsetY = (size - drawHeight) / 2;
            } else if (aspectRatio < 1) {
                drawWidth = size * aspectRatio;
                offsetX = (size - drawWidth) / 2;
            }

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        });
    }, []);

    useEffect(() => {
        if (!sourceImage) return;
        const frame = requestAnimationFrame(() => generateFavicons(sourceImage));
        return () => cancelAnimationFrame(frame);
    }, [generateFavicons, sourceImage]);

    const downloadFavicon = (size: number) => {
        const canvas = canvasRefs.current[size];
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `favicon-${size}x${size}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    };

    const downloadAll = async () => {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();

        await Promise.all(FAVICON_SIZES.map((size) => new Promise<void>((resolve) => {
            const canvas = canvasRefs.current[size];
            if (!canvas) {
                resolve();
                return;
            }
            canvas.toBlob((blob) => {
                if (blob) zip.file(`favicon-${size}x${size}.png`, blob);
                resolve();
            });
        })));

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.download = 'favicons.zip';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const clearImage = () => {
        setSourceImage(null);
        setSourceName('');
        FAVICON_SIZES.forEach((size) => {
            const canvas = canvasRefs.current[size];
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) ctx.clearRect(0, 0, size, size);
        });
    };

    return (
        <ToolLayout
            title="Favicon Creator"
            description="Generate favicons in multiple sizes from your image"
            category="special"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel
                    title="Source image"
                    description={sourceImage ? sourceName : 'Upload a simple square image for best results.'}
                    actions={sourceImage && (
                        <ToolActionBar>
                            <button onClick={downloadAll} className="btn btn-primary gap-2"><Package className="h-4 w-4" />Download all</button>
                            <button onClick={clearImage} className="btn btn-secondary gap-2"><Trash2 className="h-4 w-4" />Clear</button>
                        </ToolActionBar>
                    )}
                >
                    <ToolUploadZone
                        title={sourceImage ? 'Choose a different image' : 'Choose an image'}
                        description="Recommended minimum size: 512x512 pixels"
                        icon={<ImageIcon className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'image/*', onChange: handleImageUpload }}
                    />
                </ToolPanel>

                {sourceImage ? (
                    <ToolPanel title="Generated sizes">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {FAVICON_SIZES.map((size) => (
                                <ToolResultCard
                                    key={size}
                                    title={`${size}x${size}`}
                                    actions={
                                        <button onClick={() => downloadFavicon(size)} className="btn btn-secondary h-8 gap-2 px-3">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </button>
                                    }
                                >
                                    <div className="flex aspect-square items-center justify-center rounded-md border bg-background p-4">
                                        <canvas
                                            ref={(element) => { canvasRefs.current[size] = element; }}
                                            className="max-h-full max-w-full"
                                            style={{ imageRendering: size <= 32 ? 'pixelated' : 'auto' }}
                                        />
                                    </div>
                                </ToolResultCard>
                            ))}
                        </div>
                    </ToolPanel>
                ) : (
                    <ToolEmptyState
                        icon={<ImageIcon className="h-8 w-8" />}
                        title="No image uploaded"
                        description="Upload an image to generate favicon sizes."
                    />
                )}

                <ToolPanel title="Tips">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" />Use a square image for best results.</li>
                        <li className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" />Simple shapes stay readable at 16x16 and 32x32.</li>
                        <li className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" />Common output sizes cover browser tabs, taskbars, and app icons.</li>
                    </ul>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
