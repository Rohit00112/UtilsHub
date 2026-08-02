'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, ImageIcon, Package, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolEmptyState,
    ToolPanel,
    ToolResultCard,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const SIZES = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
];

export default function FaviconCreator() {
    const [image, setImage] = useToolState<string | null>('favicon-generator', 'image', null);
    const [fileName, setFileName] = useToolState('favicon-generator', 'fileName', '');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            setImage(readerEvent.target?.result as string);
            setFileName(file.name);
        };
        reader.readAsDataURL(file);
    };

    const generateFavicons = async () => {
        if (!image) return;
        setIsGenerating(true);

        try {
            const { default: JSZip } = await import('jszip');
            const zip = new JSZip();
            const img = new window.Image();
            img.src = image;

            await new Promise<void>((resolve) => {
                img.onload = () => resolve();
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            for (const { size, name } of SIZES) {
                canvas.width = size;
                canvas.height = size;
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);

                const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
                if (blob) zip.file(name, blob);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'favicons.zip';
            link.click();
            URL.revokeObjectURL(url);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <ToolLayout
            title="Favicon Creator"
            description="Generate a complete favicon kit from a single image"
            category="image"
        >
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel title="Source image" description="Use a square PNG or SVG-style logo for the cleanest small icons.">
                    {image ? (
                        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
                            <div className="flex min-h-56 items-center justify-center rounded-lg border bg-muted/20 p-4">
                                <Image
                                    src={image}
                                    alt="Selected favicon source"
                                    width={220}
                                    height={220}
                                    className="max-h-56 w-auto rounded-md object-contain"
                                    unoptimized
                                />
                            </div>
                            <div className="flex flex-col justify-between gap-4">
                                <div>
                                    <p className="font-medium text-foreground">{fileName || 'Selected image'}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        The generated ZIP includes browser, Apple touch, and Android icon sizes.
                                    </p>
                                </div>
                                <ToolActionBar>
                                    <label className="btn btn-secondary cursor-pointer gap-2">
                                        <Upload className="h-4 w-4" />
                                        Change image
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                    <button onClick={generateFavicons} disabled={isGenerating} className="btn btn-primary gap-2">
                                        <Package className="h-4 w-4" />
                                        {isGenerating ? 'Generating' : 'Download kit'}
                                    </button>
                                </ToolActionBar>
                            </div>
                        </div>
                    ) : (
                        <ToolUploadZone
                            title="Choose an image"
                            description="Recommended: 512x512 PNG. Files stay in your browser."
                            icon={<ImageIcon className="h-8 w-8" />}
                            inputProps={{ type: 'file', accept: 'image/*', onChange: handleFileUpload }}
                        />
                    )}
                </ToolPanel>

                <ToolPanel title="Generated sizes">
                    {image ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {SIZES.map((item) => (
                                <ToolResultCard key={item.size} title={`${item.size}x${item.size}`} meta={item.name}>
                                    <div className="flex h-24 items-center justify-center rounded-md border bg-background p-3">
                                        <Image
                                            src={image}
                                            alt=""
                                            width={item.size}
                                            height={item.size}
                                            className="object-contain"
                                            style={{ width: item.size, height: item.size }}
                                            unoptimized
                                        />
                                    </div>
                                </ToolResultCard>
                            ))}
                        </div>
                    ) : (
                        <ToolEmptyState
                            icon={<Download className="h-8 w-8" />}
                            title="No favicon preview yet"
                            description="Upload an image to preview each generated icon size."
                        />
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
