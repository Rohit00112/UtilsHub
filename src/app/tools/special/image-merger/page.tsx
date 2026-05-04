'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import ToolLayout from '@/components/ToolLayout';

interface ImageItem {
    id: string;
    file: File;
    url: string;
    width: number;
    height: number;
    img: HTMLImageElement;
}

export default function ImageMerger() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [layout, setLayout] = useState<'vertical' | 'horizontal' | 'grid'>('vertical');
    const [gap, setGap] = useState(0);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [columns, setColumns] = useState(2);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages: Promise<ImageItem>[] = Array.from(e.target.files).map(file => {
                return new Promise((resolve) => {
                    const url = URL.createObjectURL(file);
                    const img = new Image();
                    img.onload = () => {
                        resolve({
                            id: Math.random().toString(36).substr(2, 9),
                            file,
                            url,
                            width: img.width,
                            height: img.height,
                            img
                        });
                    };
                    img.src = url;
                });
            });

            Promise.all(newImages).then(loadedImages => {
                setImages(prev => [...prev, ...loadedImages]);
            });
        }
    };

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === images.length - 1)
        ) return;

        const newImages = [...images];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
        setImages(newImages);
    };

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || images.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let totalWidth = 0;
        let totalHeight = 0;

        // Calculate dimensions
        if (layout === 'vertical') {
            totalWidth = Math.max(...images.map(img => img.width));
            totalHeight = images.reduce((sum, img) => sum + img.height, 0) + (images.length - 1) * gap;
        } else if (layout === 'horizontal') {
            totalWidth = images.reduce((sum, img) => sum + img.width, 0) + (images.length - 1) * gap;
            totalHeight = Math.max(...images.map(img => img.height));
        } else if (layout === 'grid') {
            // Simple grid: assuming all images might have different sizes, 
            // we calculate row heights and column widths based on max in that row/col?
            // Or simpler: just stack them in rows. 
            // Let's go with a simpler approach: fixed column width based on max width / columns? 
            // No, that distorts. 
            // Let's just place them.
            // Better approach for grid: 
            // Calculate max width of a cell based on the widest image? No.
            // Let's just sum widths for row width, and sum max row heights for total height.
            // But images can be different sizes.
            // Let's assume we want to pack them.
            // For simplicity in this tool: We'll calculate row heights based on the tallest image in that row.

            // First pass: calculate dimensions
            let currentRowWidth = 0;
            let currentRowHeight = 0;
            let maxWidth = 0;
            let currentY = 0;

            for (let i = 0; i < images.length; i++) {
                if (i > 0 && i % columns === 0) {
                    maxWidth = Math.max(maxWidth, currentRowWidth);
                    currentY += currentRowHeight + gap;
                    currentRowWidth = 0;
                    currentRowHeight = 0;
                }

                currentRowWidth += images[i].width + (i % columns !== columns - 1 ? gap : 0);
                currentRowHeight = Math.max(currentRowHeight, images[i].height);
            }
            maxWidth = Math.max(maxWidth, currentRowWidth);
            totalHeight = currentY + currentRowHeight;
            totalWidth = maxWidth;
        }

        // Set canvas size
        canvas.width = totalWidth;
        canvas.height = totalHeight;

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw images
        let currentX = 0;
        let currentY = 0;
        let currentRowHeight = 0;

        images.forEach((image, index) => {
            if (layout === 'vertical') {
                // Center horizontally
                const x = (totalWidth - image.width) / 2;
                ctx.drawImage(image.img, x, currentY);
                currentY += image.height + gap;
            } else if (layout === 'horizontal') {
                // Center vertically
                const y = (totalHeight - image.height) / 2;
                ctx.drawImage(image.img, currentX, y);
                currentX += image.width + gap;
            } else if (layout === 'grid') {
                if (index > 0 && index % columns === 0) {
                    currentX = 0;
                    currentY += currentRowHeight + gap;
                    currentRowHeight = 0;
                }

                // Update current row height to be max of this row so far (actually need pre-calc for perfect alignment, 
                // but for simple grid we can just align top)
                // To align properly in rows, we need to know the max height of the current row beforehand.
                // Let's re-calculate row height for the current row
                const rowStart = Math.floor(index / columns) * columns;
                const rowEnd = Math.min(rowStart + columns, images.length);
                let maxRowH = 0;
                for (let i = rowStart; i < rowEnd; i++) {
                    maxRowH = Math.max(maxRowH, images[i].height);
                }
                currentRowHeight = maxRowH;

                // Center in cell? Or just top-left? Let's do center vertically in the row, center horizontally in "column slot"?
                // Variable width columns make "column slot" hard.
                // Let's just append them left-to-right.

                // Vertical centering in the row:
                const y = currentY + (maxRowH - image.height) / 2;
                ctx.drawImage(image.img, currentX, y);

                currentX += image.width + gap;
            }
        });

    }, [images, layout, gap, backgroundColor, columns]);

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
            description="Combine multiple images into a single file with custom layouts"
            category="special"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Controls */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Layout</label>
                            <select
                                value={layout}
                                onChange={(e) => setLayout(e.target.value as any)}
                                className="input w-full"
                            >
                                <option value="vertical">Vertical</option>
                                <option value="horizontal">Horizontal</option>
                                <option value="grid">Grid</option>
                            </select>
                        </div>
                        {layout === 'grid' && (
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Columns</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={columns}
                                    onChange={(e) => setColumns(Number(e.target.value))}
                                    className="input w-full"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Gap (px)</label>
                            <input
                                type="number"
                                min="0"
                                value={gap}
                                onChange={(e) => setGap(Number(e.target.value))}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Background</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="h-10 w-10 rounded cursor-pointer border border-border"
                                />
                                <input
                                    type="text"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="input flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-between items-center border-t border-border pt-6">
                        <label className="btn btn-secondary cursor-pointer">
                            <span>➕ Add Images</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={downloadImage}
                            disabled={images.length === 0}
                            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            💾 Download Merged Image
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Image List */}
                    <div className="lg:col-span-1 bg-bg-secondary border-2 border-border rounded-lg p-4 h-fit max-h-[600px] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Images ({images.length})</h3>
                        <div className="space-y-3">
                            {images.map((img, index) => (
                                <div key={img.id} className="flex items-center gap-3 bg-bg-tertiary p-2 rounded border border-border group">
                                    <NextImage
                                        src={img.url}
                                        alt="thumbnail"
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-cover rounded bg-bg-primary"
                                        unoptimized
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-text-primary truncate">{img.file.name}</p>
                                        <p className="text-xs text-text-secondary">{img.width}x{img.height}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => moveImage(index, 'up')} disabled={index === 0} className="text-text-secondary hover:text-primary disabled:opacity-30">↑</button>
                                        <button onClick={() => moveImage(index, 'down')} disabled={index === images.length - 1} className="text-text-secondary hover:text-primary disabled:opacity-30">↓</button>
                                    </div>
                                    <button onClick={() => removeImage(img.id)} className="text-text-secondary hover:text-red-500 p-1">✕</button>
                                </div>
                            ))}
                            {images.length === 0 && (
                                <p className="text-text-tertiary text-center py-8 italic">No images added</p>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="lg:col-span-2 bg-bg-tertiary border-2 border-border rounded-lg p-4 overflow-auto flex items-center justify-center min-h-[400px]">
                        {images.length > 0 ? (
                            <canvas ref={canvasRef} className="max-w-full shadow-lg" />
                        ) : (
                            <div className="text-center text-text-tertiary">
                                <div className="text-6xl mb-4 opacity-20">🖼️</div>
                                <p>Preview will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
