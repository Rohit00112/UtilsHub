'use client';

import { useRef, useState } from 'react';
import { Check, Copy, Pipette, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolEmptyState, ToolPanel, ToolStatus, ToolUploadZone } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';
import { dominantColors, rgbToHex } from '@/lib/image-processing';

interface PickedColor {
    hex: string;
    rgb: string;
}

export default function ImageColorPicker() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fileName, setFileName] = useToolState('image-color-picker', 'fileName', '');
    const [selected, setSelected] = useToolState<PickedColor | null>('image-color-picker', 'selected', null);
    const [palette, setPalette] = useToolState<string[]>('image-color-picker', 'palette', []);
    const [copied, setCopied] = useState('');
    const [error, setError] = useState('');

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setError('');
        try {
            const bitmap = await createImageBitmap(file);
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) throw new Error('Canvas rendering is unavailable.');
            context.drawImage(bitmap, 0, 0);

            const sample = document.createElement('canvas');
            const scale = Math.min(1, 96 / Math.max(bitmap.width, bitmap.height));
            sample.width = Math.max(1, Math.round(bitmap.width * scale));
            sample.height = Math.max(1, Math.round(bitmap.height * scale));
            const sampleContext = sample.getContext('2d', { willReadFrequently: true });
            if (!sampleContext) throw new Error('Canvas sampling is unavailable.');
            sampleContext.drawImage(bitmap, 0, 0, sample.width, sample.height);
            bitmap.close();
            setPalette(dominantColors(sampleContext.getImageData(0, 0, sample.width, sample.height).data));
            setFileName(file.name);
            setSelected(null);
            setCopied('');
        } catch {
            setError('Unable to read that image. Try a PNG, JPEG, or WebP file.');
        }
    };

    const pickColor = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d', { willReadFrequently: true });
        if (!canvas || !context) return;
        const bounds = canvas.getBoundingClientRect();
        const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((event.clientX - bounds.left) * canvas.width / bounds.width)));
        const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((event.clientY - bounds.top) * canvas.height / bounds.height)));
        const [red, green, blue] = context.getImageData(x, y, 1, 1).data;
        setSelected({ hex: rgbToHex(red, green, blue), rgb: `rgb(${red}, ${green}, ${blue})` });
    };

    const copy = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setCopied(value);
        window.setTimeout(() => setCopied(''), 1400);
    };

    return (
        <ToolLayout title="Image Color Picker" description="Pick an exact pixel color and extract a palette from any image" category="image">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Image">
                    <ToolUploadZone
                        title={fileName || 'Choose an image'}
                        description="Click anywhere on the preview to sample a pixel"
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'image/*', onChange: handleFile }}
                    />
                    {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                </ToolPanel>

                <div className={fileName ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]' : 'hidden'}>
                        <ToolPanel title="Pick a color" description="Click or tap the image to inspect that pixel.">
                            <div className="overflow-auto rounded-xl border bg-muted/20 p-3">
                                <canvas
                                    ref={canvasRef}
                                    onPointerDown={pickColor}
                                    className="mx-auto block h-auto max-w-full cursor-crosshair"
                                    aria-label="Image preview. Click to pick a color."
                                />
                            </div>
                        </ToolPanel>

                        <div className="space-y-6">
                            <ToolPanel title="Selected color">
                                {selected ? (
                                    <div>
                                        <div className="h-24 rounded-xl border" style={{ backgroundColor: selected.hex }} />
                                        {[selected.hex, selected.rgb].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => copy(value)}
                                                className="mt-3 flex w-full items-center justify-between rounded-xl border bg-background px-3 py-2 font-mono text-sm"
                                            >
                                                {value}
                                                {copied === value ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <ToolEmptyState icon={<Pipette className="h-7 w-7" />} title="No color selected" description="Click the image to sample a pixel." className="min-h-32" />
                                )}
                            </ToolPanel>

                            <ToolPanel title="Image palette">
                                <div className="grid grid-cols-3 gap-2">
                                    {palette.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => copy(color)}
                                            className="group overflow-hidden rounded-xl border bg-background text-left"
                                            aria-label={`Copy ${color}`}
                                        >
                                            <span className="block h-14" style={{ backgroundColor: color }} />
                                            <span className="block px-1 py-2 text-center font-mono text-[11px] text-muted-foreground group-hover:text-foreground">
                                                {copied === color ? 'Copied' : color}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </ToolPanel>
                        </div>
                </div>
                {!fileName && (
                    <ToolEmptyState icon={<Pipette className="h-8 w-8" />} title="No image selected" description="Choose an image to start picking colors." />
                )}
            </div>
        </ToolLayout>
    );
}
