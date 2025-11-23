'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';

const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];

export default function FaviconCreator() {
    const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
    const [sourceUrl, setSourceUrl] = useState('');
    const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setSourceImage(img);
                setSourceUrl(event.target?.result as string);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const generateFavicons = useCallback((img: HTMLImageElement) => {
        FAVICON_SIZES.forEach(size => {
            const canvas = canvasRefs.current[size];
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = size;
            canvas.height = size;

            // Clear canvas
            ctx.clearRect(0, 0, size, size);

            // Calculate dimensions to maintain aspect ratio
            const aspectRatio = img.width / img.height;
            let drawWidth = size;
            let drawHeight = size;
            let offsetX = 0;
            let offsetY = 0;

            if (aspectRatio > 1) {
                // Wider than tall
                drawHeight = size / aspectRatio;
                offsetY = (size - drawHeight) / 2;
            } else if (aspectRatio < 1) {
                // Taller than wide
                drawWidth = size * aspectRatio;
                offsetX = (size - drawWidth) / 2;
            }

            // Draw image centered
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        });
    }, []);

    // Draw favicons when sourceImage changes
    useEffect(() => {
        if (sourceImage) {
            // Small delay to ensure canvases are mounted
            setTimeout(() => generateFavicons(sourceImage), 0);
        }
    }, [sourceImage, generateFavicons]);

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
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        // Convert all canvases to blobs and add to zip
        const promises = FAVICON_SIZES.map(size => {
            return new Promise<void>((resolve) => {
                const canvas = canvasRefs.current[size];
                if (!canvas) {
                    resolve();
                    return;
                }

                canvas.toBlob((blob) => {
                    if (blob) {
                        zip.file(`favicon-${size}x${size}.png`, blob);
                    }
                    resolve();
                });
            });
        });

        await Promise.all(promises);

        // Generate and download zip
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
        setSourceUrl('');
        FAVICON_SIZES.forEach(size => {
            const canvas = canvasRefs.current[size];
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, size, size);
            }
        });
    };

    return (
        <ToolLayout
            title="Favicon Creator"
            description="Generate favicons in multiple sizes from your image"
            category="special"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Upload Section */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex-1">
                            <label className="block text-lg font-semibold text-text-primary mb-4">Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-text-secondary
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-primary/10 file:text-primary
                                    hover:file:bg-primary/20
                                    cursor-pointer"
                            />
                        </div>
                        {sourceImage && (
                            <div className="flex gap-3">
                                <button
                                    onClick={downloadAll}
                                    className="btn btn-primary"
                                >
                                    💾 Download All Sizes
                                </button>
                                <button
                                    onClick={clearImage}
                                    className="btn btn-secondary"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Grid */}
                {sourceImage ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {FAVICON_SIZES.map(size => (
                            <div key={size} className="bg-bg-secondary border-2 border-border rounded-lg p-4 flex flex-col items-center">
                                <div className="mb-3 flex items-center justify-center bg-bg-tertiary rounded-lg p-4 w-full aspect-square">
                                    <canvas
                                        ref={el => { canvasRefs.current[size] = el; }}
                                        className="max-w-full max-h-full"
                                        style={{ imageRendering: size <= 32 ? 'pixelated' : 'auto' }}
                                    />
                                </div>
                                <p className="text-sm font-semibold text-text-primary mb-2">{size}x{size}</p>
                                <button
                                    onClick={() => downloadFavicon(size)}
                                    className="text-xs px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors font-medium"
                                >
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-bg-secondary border-2 border-dashed border-border rounded-lg p-16 text-center">
                        <div className="text-8xl mb-6 opacity-20">🎨</div>
                        <h3 className="text-2xl font-bold text-text-primary mb-2">No Image Uploaded</h3>
                        <p className="text-text-secondary">Upload an image to generate favicons in multiple sizes</p>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-bg-secondary/50 border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">💡 Tips</h3>
                    <ul className="space-y-2 text-text-secondary text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Use a square image (1:1 aspect ratio) for best results</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Recommended minimum size: 512x512 pixels</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Simple designs work better at smaller sizes (16x16, 32x32)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Common sizes: 16x16 (browser tab), 32x32 (taskbar), 180x180 (Apple touch icon)</span>
                        </li>
                    </ul>
                </div>
            </div>
        </ToolLayout>
    );
}
