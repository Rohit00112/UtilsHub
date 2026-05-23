'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, FileArchive, Image as ImageIcon, Upload, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolEmptyState, ToolPanel, ToolStatus, ToolUploadZone } from '@/components/tools/ToolPrimitives';

interface SourceImage {
    id: string;
    file: File;
    previewUrl: string;
}

interface ConvertedImage {
    id: string;
    name: string;
    url: string;
    blob: Blob;
    originalSize: number;
    outputSize: number;
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** sizeIndex).toFixed(sizeIndex === 0 ? 0 : 1)} ${units[sizeIndex]}`;
}

function downloadBlob(url: string, name: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
}

async function imageToCanvas(file: File) {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) {
        bitmap.close();
        throw new Error('Canvas rendering is not available in this browser.');
    }
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('This browser could not export WebP images.'));
                return;
            }
            resolve(blob);
        }, 'image/webp', quality);
    });
}

export default function WebPConverter() {
    const [images, setImages] = useState<SourceImage[]>([]);
    const [converted, setConverted] = useState<ConvertedImage[]>([]);
    const [quality, setQuality] = useState(82);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const clearConverted = () => {
        converted.forEach((image) => URL.revokeObjectURL(image.url));
        setConverted([]);
    };

    const clearImages = () => {
        images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        clearConverted();
        setImages([]);
        setError('');
    };

    const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
        clearImages();
        if (files.length === 0) return;

        setImages(files.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            file,
            previewUrl: URL.createObjectURL(file),
        })));
    };

    const convertImages = async () => {
        if (images.length === 0) {
            setError('Choose one or more images before converting.');
            return;
        }

        clearConverted();
        setError('');
        setIsProcessing(true);

        try {
            const output = await Promise.all(images.map(async (image) => {
                const canvas = await imageToCanvas(image.file);
                const blob = await canvasToBlob(canvas, quality / 100);
                const baseName = image.file.name.replace(/\.[^.]+$/, '') || 'image';
                const name = `${baseName}.webp`;

                return {
                    id: image.id,
                    name,
                    blob,
                    url: URL.createObjectURL(blob),
                    originalSize: image.file.size,
                    outputSize: blob.size,
                };
            }));

            setConverted(output);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to convert these images.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadZip = async () => {
        if (converted.length === 0) return;

        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        converted.forEach((image) => zip.file(image.name, image.blob));
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        downloadBlob(url, 'webp-images.zip');
        URL.revokeObjectURL(url);
    };

    return (
        <ToolLayout title="WebP Converter" description="Convert images to WebP with quality control" category="image">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Images">
                    <ToolUploadZone
                        title={images.length > 0 ? `${images.length} images selected` : 'Choose images'}
                        description="PNG, JPEG, and other browser-supported image formats"
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', multiple: true, accept: 'image/*', onChange: handleFiles }}
                    />
                </ToolPanel>

                <ToolPanel title="Conversion settings">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <label htmlFor="quality" className="mb-2 block text-sm font-medium text-muted-foreground">
                                Quality: {quality}%
                            </label>
                            <input
                                id="quality"
                                type="range"
                                min="10"
                                max="100"
                                value={quality}
                                onChange={(event) => setQuality(Number(event.target.value))}
                                className="w-full accent-current"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={convertImages} disabled={images.length === 0 || isProcessing} className="btn btn-primary gap-2">
                                <Wand2 className="h-4 w-4" />
                                {isProcessing ? 'Converting' : 'Convert'}
                            </button>
                            <button onClick={clearImages} disabled={images.length === 0} className="btn btn-secondary">
                                Clear
                            </button>
                        </div>
                    </div>

                    {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                </ToolPanel>

                {images.length > 0 && (
                    <ToolPanel title="Preview">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {images.map((image) => (
                                <div key={image.id} className="overflow-hidden rounded-md border bg-muted/30">
                                    <div className="relative h-36 w-full">
                                        <Image src={image.previewUrl} alt={image.file.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="p-3">
                                        <div className="truncate text-sm font-medium text-foreground">{image.file.name}</div>
                                        <div className="text-xs text-muted-foreground">{formatBytes(image.file.size)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ToolPanel>
                )}

                <ToolPanel
                    title="Converted files"
                    description={converted.length > 0 ? `${converted.length} WebP images ready.` : 'Converted WebP files will appear here.'}
                    actions={<button onClick={downloadZip} disabled={converted.length === 0} className="btn btn-secondary gap-2"><FileArchive className="h-4 w-4" />Download ZIP</button>}
                >
                    {converted.length === 0 ? (
                        <ToolEmptyState title="No converted files" description="Upload images and run conversion." />
                    ) : (
                        <div className="divide-y rounded-md border">
                            {converted.map((image) => {
                                const change = ((image.originalSize - image.outputSize) / image.originalSize) * 100;

                                return (
                                    <div key={image.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 font-medium text-foreground">
                                                <ImageIcon className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{image.name}</span>
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                {formatBytes(image.originalSize)} to {formatBytes(image.outputSize)} ({change >= 0 ? '-' : '+'}{Math.abs(change).toFixed(1)}%)
                                            </div>
                                        </div>
                                        <button onClick={() => downloadBlob(image.url, image.name)} className="btn btn-secondary gap-2 justify-self-start md:justify-self-end">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
