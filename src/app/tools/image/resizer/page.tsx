'use client';

import { useState } from 'react';
import { Download, FileArchive, Image as ImageIcon, Maximize2, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';

type ResizeMode = 'dimensions' | 'percentage';
type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

interface SourceImage {
    id: string;
    file: File;
    previewUrl: string;
    width: number;
    height: number;
}

interface ResizedImage {
    id: string;
    name: string;
    url: string;
    blob: Blob;
    originalSize: number;
    outputSize: number;
    width: number;
    height: number;
}

const formatExtensions: Record<OutputFormat, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
};

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

function canvasToBlob(canvas: HTMLCanvasElement, format: OutputFormat, quality: number) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('This browser could not export the selected image format.'));
                return;
            }
            resolve(blob);
        }, format, format === 'image/png' ? undefined : quality);
    });
}

function getTargetSize(
    image: SourceImage,
    mode: ResizeMode,
    percent: number,
    widthValue: string,
    heightValue: string,
    lockAspectRatio: boolean
) {
    if (mode === 'percentage') {
        const ratio = percent / 100;
        return {
            width: Math.max(1, Math.round(image.width * ratio)),
            height: Math.max(1, Math.round(image.height * ratio)),
        };
    }

    const width = Number(widthValue);
    const height = Number(heightValue);
    const hasWidth = Number.isFinite(width) && width > 0;
    const hasHeight = Number.isFinite(height) && height > 0;

    if (!lockAspectRatio) {
        if (!hasWidth || !hasHeight) {
            throw new Error('Enter both width and height, or enable aspect ratio lock.');
        }
        return { width: Math.round(width), height: Math.round(height) };
    }

    if (hasWidth && hasHeight) {
        const ratio = Math.min(width / image.width, height / image.height);
        return {
            width: Math.max(1, Math.round(image.width * ratio)),
            height: Math.max(1, Math.round(image.height * ratio)),
        };
    }

    if (hasWidth) {
        return {
            width: Math.round(width),
            height: Math.max(1, Math.round((width / image.width) * image.height)),
        };
    }

    if (hasHeight) {
        return {
            width: Math.max(1, Math.round((height / image.height) * image.width)),
            height: Math.round(height),
        };
    }

    throw new Error('Enter a target width or height.');
}

export default function ImageResizer() {
    const [images, setImages] = useState<SourceImage[]>([]);
    const [resized, setResized] = useState<ResizedImage[]>([]);
    const [mode, setMode] = useState<ResizeMode>('percentage');
    const [percent, setPercent] = useState(50);
    const [targetWidth, setTargetWidth] = useState('');
    const [targetHeight, setTargetHeight] = useState('');
    const [lockAspectRatio, setLockAspectRatio] = useState(true);
    const [format, setFormat] = useState<OutputFormat>('image/webp');
    const [quality, setQuality] = useState(85);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const clearResized = () => {
        resized.forEach((image) => URL.revokeObjectURL(image.url));
        setResized([]);
    };

    const clearImages = () => {
        images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        clearResized();
        setImages([]);
        setError('');
    };

    const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
        clearImages();
        if (files.length === 0) return;

        try {
            const loaded = await Promise.all(files.map(async (file) => {
                const bitmap = await createImageBitmap(file);
                const image = {
                    id: `${file.name}-${file.size}-${file.lastModified}`,
                    file,
                    previewUrl: URL.createObjectURL(file),
                    width: bitmap.width,
                    height: bitmap.height,
                };
                bitmap.close();
                return image;
            }));

            setImages(loaded);
            setTargetWidth(String(loaded[0].width));
            setTargetHeight(String(loaded[0].height));
        } catch {
            setError('Unable to read one or more selected images.');
        }
    };

    const resizeImages = async () => {
        if (images.length === 0) {
            setError('Choose one or more images before resizing.');
            return;
        }

        clearResized();
        setError('');
        setIsProcessing(true);

        try {
            const output = await Promise.all(images.map(async (image) => {
                const size = getTargetSize(image, mode, percent, targetWidth, targetHeight, lockAspectRatio);
                const bitmap = await createImageBitmap(image.file);
                const canvas = document.createElement('canvas');
                canvas.width = size.width;
                canvas.height = size.height;
                const context = canvas.getContext('2d');
                if (!context) {
                    bitmap.close();
                    throw new Error('Canvas rendering is not available in this browser.');
                }

                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = 'high';
                context.drawImage(bitmap, 0, 0, size.width, size.height);
                bitmap.close();

                const blob = await canvasToBlob(canvas, format, quality / 100);
                const baseName = image.file.name.replace(/\.[^.]+$/, '') || 'resized-image';
                const name = `${baseName}-${size.width}x${size.height}.${formatExtensions[format]}`;

                return {
                    id: image.id,
                    name,
                    blob,
                    url: URL.createObjectURL(blob),
                    originalSize: image.file.size,
                    outputSize: blob.size,
                    width: size.width,
                    height: size.height,
                };
            }));

            setResized(output);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to resize these images.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadZip = async () => {
        if (resized.length === 0) return;

        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        resized.forEach((image) => zip.file(image.name, image.blob));
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        downloadBlob(url, 'resized-images.zip');
        URL.revokeObjectURL(url);
    };

    return (
        <ToolLayout title="Image Resizer" description="Resize images by dimensions or percentage" category="image">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className="rounded-lg border bg-card p-5 sm:p-6">
                    <label className="block text-sm font-medium text-muted-foreground">Images</label>
                    <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/40">
                        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                        <span className="font-medium text-foreground">{images.length > 0 ? `${images.length} images selected` : 'Choose images'}</span>
                        <span className="mt-1 text-sm text-muted-foreground">Resize PNG, JPEG, WebP, and other browser-supported images</span>
                        <input type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
                    </label>
                </section>

                <section className="rounded-lg border bg-card p-5 sm:p-6">
                    <div className="grid gap-5 lg:grid-cols-2">
                        <div>
                            <label htmlFor="mode" className="mb-2 block text-sm font-medium text-muted-foreground">
                                Resize mode
                            </label>
                            <select id="mode" value={mode} onChange={(event) => setMode(event.target.value as ResizeMode)} className="input h-10">
                                <option value="percentage">Percentage</option>
                                <option value="dimensions">Dimensions</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="format" className="mb-2 block text-sm font-medium text-muted-foreground">
                                Output format
                            </label>
                            <select id="format" value={format} onChange={(event) => setFormat(event.target.value as OutputFormat)} className="input h-10">
                                <option value="image/webp">WebP</option>
                                <option value="image/jpeg">JPEG</option>
                                <option value="image/png">PNG</option>
                            </select>
                        </div>
                    </div>

                    {mode === 'percentage' ? (
                        <div className="mt-5">
                            <label htmlFor="percent" className="mb-2 block text-sm font-medium text-muted-foreground">
                                Scale: {percent}%
                            </label>
                            <input
                                id="percent"
                                type="range"
                                min="1"
                                max="200"
                                value={percent}
                                onChange={(event) => setPercent(Number(event.target.value))}
                                className="w-full accent-current"
                            />
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                            <div>
                                <label htmlFor="width" className="mb-2 block text-sm font-medium text-muted-foreground">
                                    Width
                                </label>
                                <input id="width" type="number" min="1" value={targetWidth} onChange={(event) => setTargetWidth(event.target.value)} className="input h-10" />
                            </div>
                            <div>
                                <label htmlFor="height" className="mb-2 block text-sm font-medium text-muted-foreground">
                                    Height
                                </label>
                                <input id="height" type="number" min="1" value={targetHeight} onChange={(event) => setTargetHeight(event.target.value)} className="input h-10" />
                            </div>
                            <label className="inline-flex h-10 items-center gap-2 rounded-md border bg-muted/30 px-3 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={lockAspectRatio}
                                    onChange={(event) => setLockAspectRatio(event.target.checked)}
                                    className="h-4 w-4 accent-current"
                                />
                                Lock ratio
                            </label>
                        </div>
                    )}

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
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
                                disabled={format === 'image/png'}
                                onChange={(event) => setQuality(Number(event.target.value))}
                                className="w-full accent-current disabled:opacity-50"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={resizeImages} disabled={images.length === 0 || isProcessing} className="btn btn-primary gap-2">
                                <Maximize2 className="h-4 w-4" />
                                {isProcessing ? 'Resizing' : 'Resize'}
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
                        <h3 className="mb-4 text-lg font-semibold text-foreground">Original images</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {images.map((image) => (
                                <div key={image.id} className="overflow-hidden rounded-md border bg-muted/30">
                                    <img src={image.previewUrl} alt={image.file.name} className="h-36 w-full object-cover" />
                                    <div className="p-3">
                                        <div className="truncate text-sm font-medium text-foreground">{image.file.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {image.width}x{image.height} - {formatBytes(image.file.size)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="rounded-lg border bg-card">
                    <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Resized files</h3>
                            <p className="text-sm text-muted-foreground">
                                {resized.length > 0 ? `${resized.length} images ready.` : 'Resized images will appear here.'}
                            </p>
                        </div>
                        <button onClick={downloadZip} disabled={resized.length === 0} className="btn btn-secondary gap-2">
                            <FileArchive className="h-4 w-4" />
                            Download ZIP
                        </button>
                    </div>

                    {resized.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Upload images and run resize.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {resized.map((image) => (
                                <div key={image.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <ImageIcon className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{image.name}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {image.width}x{image.height} - {formatBytes(image.outputSize)}
                                        </div>
                                    </div>
                                    <button onClick={() => downloadBlob(image.url, image.name)} className="btn btn-secondary gap-2 justify-self-start md:justify-self-end">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </ToolLayout>
    );
}
