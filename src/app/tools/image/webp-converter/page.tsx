'use client';

import { useState } from 'react';
import { Download, FileArchive, Image as ImageIcon, Upload, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';

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
                <section className="rounded-lg border bg-card p-5 sm:p-6">
                    <label className="block text-sm font-medium text-muted-foreground">Images</label>
                    <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/40">
                        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                        <span className="font-medium text-foreground">{images.length > 0 ? `${images.length} images selected` : 'Choose images'}</span>
                        <span className="mt-1 text-sm text-muted-foreground">PNG, JPEG, and other browser-supported image formats</span>
                        <input type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
                    </label>
                </section>

                <section className="rounded-lg border bg-card p-5 sm:p-6">
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

                    {error && (
                        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </section>

                {images.length > 0 && (
                    <section className="rounded-lg border bg-card p-5">
                        <h3 className="mb-4 text-lg font-semibold text-foreground">Preview</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {images.map((image) => (
                                <div key={image.id} className="overflow-hidden rounded-md border bg-muted/30">
                                    <img src={image.previewUrl} alt={image.file.name} className="h-36 w-full object-cover" />
                                    <div className="p-3">
                                        <div className="truncate text-sm font-medium text-foreground">{image.file.name}</div>
                                        <div className="text-xs text-muted-foreground">{formatBytes(image.file.size)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="rounded-lg border bg-card">
                    <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Converted files</h3>
                            <p className="text-sm text-muted-foreground">
                                {converted.length > 0 ? `${converted.length} WebP images ready.` : 'Converted WebP files will appear here.'}
                            </p>
                        </div>
                        <button onClick={downloadZip} disabled={converted.length === 0} className="btn btn-secondary gap-2">
                            <FileArchive className="h-4 w-4" />
                            Download ZIP
                        </button>
                    </div>

                    {converted.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Upload images and run conversion.
                        </div>
                    ) : (
                        <div className="divide-y">
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
                </section>
            </div>
        </ToolLayout>
    );
}
