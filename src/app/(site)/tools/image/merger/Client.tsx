'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Download, ImagePlus, Trash2, X } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolEmptyState,
    ToolField,
    ToolPanel,
    ToolSegmentedControl,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type LayoutMode = 'vertical' | 'horizontal' | 'grid';

interface MergeImage {
    src: string;
    width: number;
    height: number;
}

export default function ImageMerger() {
    const [images, setImages] = useToolState<MergeImage[]>('image-merger', 'images', []);
    const [layout, setLayout] = useToolState<LayoutMode>('image-merger', 'layout', 'vertical');
    const [gap, setGap] = useToolState('image-merger', 'gap', 0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const loadedImages: MergeImage[] = [];
        let loadedCount = 0;

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const img = new window.Image();
                img.onload = () => {
                    loadedImages.push({
                        src: img.src,
                        width: img.width,
                        height: img.height,
                    });
                    loadedCount += 1;
                    if (loadedCount === files.length) {
                        setImages((previous) => [...previous, ...loadedImages]);
                    }
                };
                img.src = readerEvent.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
    };

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || images.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let totalWidth = 0;
        let totalHeight = 0;

        if (layout === 'vertical') {
            totalWidth = Math.max(...images.map((img) => img.width));
            totalHeight = images.reduce((acc, img) => acc + img.height, 0) + (images.length - 1) * gap;
        } else if (layout === 'horizontal') {
            totalWidth = images.reduce((acc, img) => acc + img.width, 0) + (images.length - 1) * gap;
            totalHeight = Math.max(...images.map((img) => img.height));
        } else {
            const cols = Math.ceil(Math.sqrt(images.length));
            const rows = Math.ceil(images.length / cols);
            const maxW = Math.max(...images.map((img) => img.width));
            const maxH = Math.max(...images.map((img) => img.height));
            totalWidth = cols * maxW + (cols - 1) * gap;
            totalHeight = rows * maxH + (rows - 1) * gap;
        }

        canvas.width = totalWidth;
        canvas.height = totalHeight;
        ctx.clearRect(0, 0, totalWidth, totalHeight);

        let x = 0;
        let y = 0;

        images.forEach((img, index) => {
            const imageElement = new window.Image();
            imageElement.src = img.src;

            if (layout === 'vertical') {
                const xOffset = (totalWidth - img.width) / 2;
                ctx.drawImage(imageElement, xOffset, y);
                y += img.height + gap;
            } else if (layout === 'horizontal') {
                const yOffset = (totalHeight - img.height) / 2;
                ctx.drawImage(imageElement, x, yOffset);
                x += img.width + gap;
            } else {
                const cols = Math.ceil(Math.sqrt(images.length));
                const maxW = Math.max(...images.map((item) => item.width));
                const maxH = Math.max(...images.map((item) => item.height));
                const col = index % cols;
                const row = Math.floor(index / cols);
                const drawX = col * (maxW + gap) + (maxW - img.width) / 2;
                const drawY = row * (maxH + gap) + (maxH - img.height) / 2;
                ctx.drawImage(imageElement, drawX, drawY);
            }
        });
    }, [gap, images, layout]);

    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    const downloadImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'merged-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <ToolLayout
            title="Image Merger"
            description="Merge multiple images into a single image"
            category="image"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Merge settings" description="Choose the order and layout, then export the merged PNG.">
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
                        <ToolUploadZone
                            title="Add images"
                            description={`${images.length} selected. PNG, JPEG, and WebP are supported.`}
                            icon={<ImagePlus className="h-8 w-8" />}
                            inputProps={{ type: 'file', multiple: true, accept: 'image/*', onChange: handleFileUpload }}
                            className="py-6"
                        />
                        <ToolField label="Layout">
                            <ToolSegmentedControl
                                value={layout}
                                onChange={setLayout}
                                options={[
                                    { label: 'Vertical', value: 'vertical' },
                                    { label: 'Horizontal', value: 'horizontal' },
                                    { label: 'Grid', value: 'grid' },
                                ]}
                            />
                        </ToolField>
                        <ToolField label={`Gap: ${gap}px`}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={gap}
                                onChange={(event) => setGap(Number(event.target.value))}
                                className="w-full"
                            />
                        </ToolField>
                    </div>
                    <ToolActionBar className="mt-4">
                        <button onClick={downloadImage} disabled={images.length === 0} className="btn btn-primary gap-2">
                            <Download className="h-4 w-4" />
                            Download merged image
                        </button>
                        <button onClick={() => setImages([])} disabled={images.length === 0} className="btn btn-secondary gap-2">
                            <Trash2 className="h-4 w-4" />
                            Clear
                        </button>
                    </ToolActionBar>
                </ToolPanel>

                {images.length > 0 && (
                    <ToolPanel title="Selected images">
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {images.map((img, index) => (
                                <div key={`${img.src}-${index}`} className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted/20">
                                    <Image src={img.src} alt="" fill className="object-cover" unoptimized />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        aria-label="Remove image"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </ToolPanel>
                )}

                <ToolPanel title="Preview">
                    {images.length === 0 ? (
                        <ToolEmptyState
                            icon={<ImagePlus className="h-8 w-8" />}
                            title="No images selected"
                            description="Add two or more images to preview the combined output."
                        />
                    ) : (
                        <div className="flex min-h-[360px] items-center justify-center overflow-auto rounded-lg border bg-muted/20 p-4">
                            <canvas ref={canvasRef} className="h-auto max-w-full rounded-md bg-background shadow-sm" />
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
