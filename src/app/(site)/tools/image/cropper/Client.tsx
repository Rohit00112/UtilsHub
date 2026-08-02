'use client';

import { useEffect, useRef, useState } from 'react';
import { Crop, Download, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';
import { normalizeImageRect, type ImageRect } from '@/lib/image-processing';

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9';
type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

const extension: Record<OutputFormat, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
};

export default function ImageCropper() {
    const sourceRef = useRef<HTMLCanvasElement>(null);
    const previewRef = useRef<HTMLCanvasElement>(null);
    const [fileName, setFileName] = useToolState('image-cropper', 'fileName', '');
    const [imageSize, setImageSize] = useToolState('image-cropper', 'imageSize', { width: 0, height: 0 });
    const [crop, setCrop] = useToolState<ImageRect>('image-cropper', 'crop', { x: 0, y: 0, width: 1, height: 1 });
    const [ratio, setRatio] = useToolState<AspectRatio>('image-cropper', 'ratio', 'free');
    const [format, setFormat] = useToolState<OutputFormat>('image-cropper', 'format', 'image/png');
    const [quality, setQuality] = useToolState('image-cropper', 'quality', 90);
    const [error, setError] = useState('');

    useEffect(() => {
        const source = sourceRef.current;
        const preview = previewRef.current;
        if (!source || !preview || imageSize.width === 0) return;
        preview.width = source.width;
        preview.height = source.height;
        const context = preview.getContext('2d');
        if (!context) return;
        const rect = normalizeImageRect(crop, source.width, source.height);
        context.drawImage(source, 0, 0);
        context.fillStyle = 'rgba(15, 23, 42, 0.58)';
        context.fillRect(0, 0, preview.width, preview.height);
        context.drawImage(source, rect.x, rect.y, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height);
        context.strokeStyle = '#22c55e';
        context.lineWidth = Math.max(2, Math.round(source.width / 500));
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }, [crop, imageSize]);

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setError('');
        try {
            const bitmap = await createImageBitmap(file);
            const source = sourceRef.current;
            if (!source) return;
            source.width = bitmap.width;
            source.height = bitmap.height;
            const context = source.getContext('2d');
            if (!context) throw new Error('Canvas rendering is unavailable.');
            context.drawImage(bitmap, 0, 0);
            bitmap.close();
            setFileName(file.name);
            setImageSize({ width: source.width, height: source.height });
            setCrop({ x: 0, y: 0, width: source.width, height: source.height });
            setRatio('free');
        } catch {
            setError('Unable to read that image. Try a PNG, JPEG, or WebP file.');
        }
    };

    const applyRatio = (nextRatio: AspectRatio) => {
        setRatio(nextRatio);
        if (nextRatio === 'free' || imageSize.width === 0) return;
        const [wide, high] = nextRatio.split(':').map(Number);
        const target = wide / high;
        let width = imageSize.width;
        let height = Math.round(width / target);
        if (height > imageSize.height) {
            height = imageSize.height;
            width = Math.round(height * target);
        }
        setCrop({
            x: Math.round((imageSize.width - width) / 2),
            y: Math.round((imageSize.height - height) / 2),
            width,
            height,
        });
    };

    const updateCrop = (key: keyof ImageRect, value: string) => {
        setRatio('free');
        setCrop((current) => ({ ...current, [key]: Number(value) || 0 }));
    };

    const download = () => {
        const source = sourceRef.current;
        if (!source) return;
        const rect = normalizeImageRect(crop, source.width, source.height);
        const output = document.createElement('canvas');
        output.width = rect.width;
        output.height = rect.height;
        const context = output.getContext('2d');
        if (!context) return;
        context.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
        output.toBlob((blob) => {
            if (!blob) {
                setError('This browser could not export the cropped image.');
                return;
            }
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName.replace(/\.[^.]+$/, '') || 'image'}-cropped.${extension[format]}`;
            link.click();
            URL.revokeObjectURL(link.href);
        }, format, format === 'image/png' ? undefined : quality / 100);
    };

    return (
        <ToolLayout title="Image Cropper" description="Crop an image to exact dimensions or a common aspect ratio" category="image">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Image">
                    <ToolUploadZone
                        title={fileName || 'Choose an image'}
                        description="PNG, JPEG, and WebP are supported"
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'image/*', onChange: handleFile }}
                    />
                    {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                </ToolPanel>

                {imageSize.width > 0 && (
                    <>
                        <ToolPanel title="Crop settings">
                            <ToolField label="Aspect ratio">
                                <ToolSegmentedControl
                                    value={ratio}
                                    onChange={applyRatio}
                                    options={[
                                        { label: 'Free', value: 'free' },
                                        { label: 'Square', value: '1:1' },
                                        { label: '4:3', value: '4:3' },
                                        { label: '16:9', value: '16:9' },
                                    ]}
                                />
                            </ToolField>
                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {(['x', 'y', 'width', 'height'] as const).map((key) => (
                                    <ToolField key={key} label={key === 'x' || key === 'y' ? key.toUpperCase() : `${key[0].toUpperCase()}${key.slice(1)}`}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={Math.round(crop[key])}
                                            onChange={(event) => updateCrop(key, event.target.value)}
                                            className="input h-10"
                                        />
                                    </ToolField>
                                ))}
                            </div>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <ToolField label="Output format">
                                    <select value={format} onChange={(event) => setFormat(event.target.value as OutputFormat)} className="input h-10">
                                        <option value="image/png">PNG</option>
                                        <option value="image/jpeg">JPEG</option>
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
                                <button type="button" onClick={download} className="btn btn-primary gap-2">
                                    <Crop className="h-4 w-4" />
                                    Crop and download
                                </button>
                                <span className="text-sm text-muted-foreground">
                                    Output: {normalizeImageRect(crop, imageSize.width, imageSize.height).width} × {normalizeImageRect(crop, imageSize.width, imageSize.height).height}px
                                </span>
                            </ToolActionBar>
                        </ToolPanel>

                        <ToolPanel
                            title="Preview"
                            actions={<button type="button" onClick={download} className="btn btn-secondary gap-2"><Download className="h-4 w-4" />Download</button>}
                        >
                            <div className="overflow-auto rounded-xl border bg-muted/20 p-3">
                                <canvas ref={previewRef} className="mx-auto block h-auto max-w-full" />
                            </div>
                        </ToolPanel>
                    </>
                )}
                <canvas ref={sourceRef} className="hidden" />
            </div>
        </ToolLayout>
    );
}
