'use client';

import { useState } from 'react';
import { Download, FileArchive, ShieldCheck, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolEmptyState,
    ToolField,
    ToolPanel,
    ToolStatus,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

interface CleanedImage {
    id: string;
    name: string;
    blob: Blob;
    url: string;
    originalSize: number;
    outputSize: number;
}

const extension: Record<OutputFormat, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
};

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function download(url: string, name: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
}

export default function MetadataRemover() {
    const [files, setFiles] = useToolState<File[]>('metadata-remover', 'files', []);
    const [cleaned, setCleaned] = useToolState<CleanedImage[]>('metadata-remover', 'cleaned', []);
    const [format, setFormat] = useToolState<OutputFormat>('metadata-remover', 'format', 'image/jpeg');
    const [quality, setQuality] = useToolState('metadata-remover', 'quality', 92);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const clearOutput = () => {
        cleaned.forEach((image) => URL.revokeObjectURL(image.url));
        setCleaned([]);
    };

    const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        clearOutput();
        setFiles(Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/')));
        setError('');
    };

    const cleanFiles = async () => {
        if (files.length === 0) return;
        clearOutput();
        setError('');
        setIsProcessing(true);

        try {
            const results = await Promise.all(files.map(async (file) => {
                const bitmap = await createImageBitmap(file);
                const canvas = document.createElement('canvas');
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Canvas rendering is unavailable.');
                if (format === 'image/jpeg') {
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }
                context.drawImage(bitmap, 0, 0);
                bitmap.close();
                const blob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob((output) => output ? resolve(output) : reject(new Error('Image export failed.')), format, format === 'image/png' ? undefined : quality / 100);
                });
                const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
                return {
                    id: `${file.name}-${file.size}-${file.lastModified}`,
                    name: `${baseName}-clean.${extension[format]}`,
                    blob,
                    url: URL.createObjectURL(blob),
                    originalSize: file.size,
                    outputSize: blob.size,
                };
            }));
            setCleaned(results);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Unable to clean these images.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadZip = async () => {
        if (cleaned.length === 0) return;
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        cleaned.forEach((image) => zip.file(image.name, image.blob));
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        download(url, 'metadata-free-images.zip');
        URL.revokeObjectURL(url);
    };

    return (
        <ToolLayout title="Image Metadata Remover" description="Strip EXIF and other metadata by rebuilding images locally" category="image">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolStatus tone="info">
                    Re-encoding removes embedded metadata such as camera details and GPS tags. Keep the original if you may need that information later.
                </ToolStatus>

                <ToolPanel title="Images">
                    <ToolUploadZone
                        title={files.length > 0 ? `${files.length} images selected` : 'Choose images'}
                        description="PNG, JPEG, WebP, and other browser-supported images"
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'image/*', multiple: true, onChange: handleFiles }}
                    />
                </ToolPanel>

                <ToolPanel title="Clean export">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <ToolField label="Output format">
                            <select value={format} onChange={(event) => setFormat(event.target.value as OutputFormat)} className="input h-10">
                                <option value="image/jpeg">JPEG</option>
                                <option value="image/png">PNG</option>
                                <option value="image/webp">WebP</option>
                            </select>
                        </ToolField>
                        <ToolField label={`Quality: ${quality}%`}>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={quality}
                                disabled={format === 'image/png'}
                                onChange={(event) => setQuality(Number(event.target.value))}
                                className="w-full accent-current disabled:opacity-50"
                            />
                        </ToolField>
                    </div>
                    <ToolActionBar className="mt-5">
                        <button type="button" onClick={cleanFiles} disabled={files.length === 0 || isProcessing} className="btn btn-primary gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            {isProcessing ? 'Removing metadata' : 'Remove metadata'}
                        </button>
                        <button type="button" onClick={() => { setFiles([]); clearOutput(); }} disabled={files.length === 0} className="btn btn-secondary">
                            Clear
                        </button>
                    </ToolActionBar>
                    {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                </ToolPanel>

                <ToolPanel
                    title="Clean files"
                    description={cleaned.length > 0 ? `${cleaned.length} metadata-free images ready.` : 'Cleaned files will appear here.'}
                    actions={<button type="button" onClick={downloadZip} disabled={cleaned.length === 0} className="btn btn-secondary gap-2"><FileArchive className="h-4 w-4" />Download ZIP</button>}
                >
                    {cleaned.length === 0 ? (
                        <ToolEmptyState title="No cleaned files" description="Choose images and remove their metadata." />
                    ) : (
                        <div className="divide-y rounded-xl border">
                            {cleaned.map((image) => (
                                <div key={image.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-foreground">{image.name}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {formatBytes(image.originalSize)} → {formatBytes(image.outputSize)}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => download(image.url, image.name)} className="btn btn-secondary gap-2">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
