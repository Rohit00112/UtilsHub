'use client';

import { useState, useRef } from 'react';
import JSZip from 'jszip';
import ToolLayout from '@/components/ToolLayout';

const SIZES = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
];

export default function FaviconCreator() {
    const [image, setImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateFavicons = async () => {
        if (!image) return;
        setIsGenerating(true);

        try {
            const zip = new JSZip();
            const img = new Image();
            img.src = image;

            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Generate PNGs
            for (const { size, name } of SIZES) {
                canvas.width = size;
                canvas.height = size;
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);

                const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    zip.file(name, blob);
                }
            }

            // Generate ICO (simplified, just 32x32 png labeled as ico is widely compatible, but better to use a library for true ICO if needed. 
            // For now, we will just include the PNGs. Browsers handle PNG favicons well.)
            // Actually, let's just create a 32x32 bitmap for favicon.ico roughly? No, real ICO format is binary.
            // Let's create 'favicon.ico' as a copy of 32x32 png, which works in many modern cases, 
            // but strictly speaking isn't a valid ICO container. 
            // Ideally we need a converter. For this simple tool, we'll provide the PNG kit.
            // Let's also verify if we can make a basic ICO.
            // We'll skip complex ICO encoding for now and focus on the standard PNG set which is modern standard.

            const content = await zip.generateAsync({ type: 'blob' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'favicons.zip';
            link.click();
        } catch (error) {
            console.error('Error generating favicons:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <ToolLayout
            title="Favicon Creator"
            description="Generate a complete set of favicons from a single image"
            category="image"
        >
            <div className="max-w-4xl mx-auto space-y-12 text-center">

                {/* Upload Area */}
                <div className="space-y-6">
                    <div className={`border-4 border-dashed rounded-3xl p-12 transition-all duration-300 ${image ? 'border-primary bg-primary/5' : 'border-border bg-bg-secondary hover:border-text-secondary'}`}>
                        {image ? (
                            <div className="relative inline-block group">
                                <img src={image} alt="Preview" className="max-h-64 rounded-xl shadow-lg" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                    <label className="btn btn-secondary cursor-pointer">
                                        Change Image
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center justify-center gap-4 h-full">
                                <span className="text-8xl">💎</span>
                                <span className="text-2xl font-bold text-text-primary">Upload your Logo</span>
                                <span className="text-text-secondary">Recommended: 512x512 PNG</span>
                                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>

                {/* Preview Grid */}
                {image && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <h3 className="text-2xl font-bold text-text-primary mb-6">Preview Generated Icons</h3>
                        <div className="flex flex-wrap justify-center gap-8 items-end bg-bg-tertiary p-8 rounded-2xl border border-border">
                            {SIZES.map((item) => (
                                <div key={item.size} className="flex flex-col items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm border border-border/50">
                                        <img src={image} alt="" style={{ width: item.size, height: item.size }} />
                                    </div>
                                    <span className="text-xs text-text-secondary font-mono">{item.size}x{item.size}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action */}
                <div className="flex justify-center">
                    <button
                        onClick={generateFavicons}
                        disabled={!image || isGenerating}
                        className={`bg-primary hover:bg-primary-dark text-white font-bold py-4 px-16 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-xl flex items-center gap-3 ${(!image || isGenerating) ? 'opacity-50 cursor-not-allowed hover:transform-none' : ''
                            }`}
                    >
                        <span>📦</span>
                        {isGenerating ? 'Generating...' : 'Download Favicon Kit'}
                    </button>
                </div>

            </div>
        </ToolLayout>
    );
}
