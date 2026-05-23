'use client';

import { useState, useRef, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';

type LayoutMode = 'vertical' | 'horizontal' | 'grid';

export default function ImageMerger() {
    const [images, setImages] = useState<{ src: string; width: number; height: number }[]>([]);
    const [layout, setLayout] = useState<LayoutMode>('vertical');
    const [gap, setGap] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages: { src: string; width: number; height: number }[] = [];
            const files = Array.from(e.target.files);

            let loadedCount = 0;
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        newImages.push({
                            src: img.src,
                            width: img.width,
                            height: img.height
                        });
                        loadedCount++;
                        if (loadedCount === files.length) {
                            setImages(prev => [...prev, ...newImages]);
                        }
                    };
                    img.src = event.target?.result as string;
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || images.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate dimensions
        let totalWidth = 0;
        let totalHeight = 0;

        if (layout === 'vertical') {
            totalWidth = Math.max(...images.map(img => img.width));
            totalHeight = images.reduce((acc, img) => acc + img.height, 0) + (images.length - 1) * gap;
        } else if (layout === 'horizontal') {
            totalWidth = images.reduce((acc, img) => acc + img.width, 0) + (images.length - 1) * gap;
            totalHeight = Math.max(...images.map(img => img.height));
        } else if (layout === 'grid') {
            const cols = Math.ceil(Math.sqrt(images.length));
            const rows = Math.ceil(images.length / cols);
            // Simplified grid: assume consistent sizing or take max
            const maxW = Math.max(...images.map(img => img.width));
            const maxH = Math.max(...images.map(img => img.height));
            totalWidth = cols * maxW + (cols - 1) * gap;
            totalHeight = rows * maxH + (rows - 1) * gap;
        }

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        // Fill background (optional, maybe transparent)
        // ctx.fillStyle = '#ffffff';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Images
        let x = 0;
        let y = 0;

        images.forEach((img, i) => {
            const imageElement = new Image();
            imageElement.src = img.src;

            if (layout === 'vertical') {
                // Center horizontally if smaller
                const xOffset = (totalWidth - img.width) / 2;
                ctx.drawImage(imageElement, xOffset, y);
                y += img.height + gap;
            } else if (layout === 'horizontal') {
                // Center vertically if smaller
                const yOffset = (totalHeight - img.height) / 2;
                ctx.drawImage(imageElement, x, yOffset);
                x += img.width + gap;
            } else if (layout === 'grid') {
                const cols = Math.ceil(Math.sqrt(images.length));
                // const rows = Math.ceil(images.length / cols);
                const maxW = Math.max(...images.map(img => img.width));
                const maxH = Math.max(...images.map(img => img.height));

                const col = i % cols;
                const row = Math.floor(i / cols);

                const drawX = col * (maxW + gap) + (maxW - img.width) / 2;
                const drawY = row * (maxH + gap) + (maxH - img.height) / 2;

                ctx.drawImage(imageElement, drawX, drawY);
            }
        });
    };

    useEffect(() => {
        drawCanvas();
    }, [images, layout, gap]);

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
            description="Merge multiple images into a single image (Vertical, Horizontal, or Grid)"
            category="image"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Controls */}
                <div className="bg-card border-2 border-border rounded-lg p-6 flex flex-wrap gap-8 items-end">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider">Upload Images</label>
                        <label className="btn btn-secondary cursor-pointer inline-flex items-center gap-2">
                            Add Images
                            <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider">Layout</label>
                        <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
                            {(['vertical', 'horizontal', 'grid'] as LayoutMode[]).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setLayout(mode)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${layout === mode
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-card'
                                        }`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gap (px): {gap}</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={gap}
                            onChange={(e) => setGap(Number(e.target.value))}
                            className="w-40"
                        />
                    </div>

                    <button
                        onClick={() => setImages([])}
                        className="text-muted-foreground hover:text-red-500 text-sm font-semibold transition-colors"
                    >
                        Reset All
                    </button>
                </div>

                {/* Images List */}
                {images.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative group flex-shrink-0 w-24 h-24 border-2 border-border bg-muted/30 rounded-lg overflow-hidden">
                                <img src={img.src} alt="" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Preview / Canvas */}
                <div className="bg-muted/30 border-2 border-dashed border-border rounded-xl p-8 flex items-center justify-center min-h-[400px] overflow-auto">
                    {images.length === 0 ? (
                        <div className="text-center text-muted-foreground">
                            <p className="text-xl">Upload images to see preview</p>
                        </div>
                    ) : (
                        <div className="shadow-2xl borde border-border bg-white" style={{ maxWidth: '100%', maxHeight: '600px', overflow: 'auto' }}>
                            <canvas ref={canvasRef} className="max-w-full h-auto" />
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={downloadImage}
                        disabled={images.length === 0}
                        className={`bg-primary hover:bg-primary-dark text-white font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg flex items-center gap-2 ${images.length === 0 ? 'opacity-50 cursor-not-allowed hover:transform-none' : ''
                            }`}
                    >
                        Download Merged Image
                    </button>
                </div>
            </div>
        </ToolLayout>
    );
}
