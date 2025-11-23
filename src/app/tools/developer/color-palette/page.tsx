'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function ColorPalette() {
    const [color, setColor] = useState('#6366f1');

    // Helper to generate shades/tints would go here (simplified for brevity)
    // In a real app, we'd use a library like tinycolor2 or colord

    return (
        <ToolLayout title="Color Palette Generator" description="Generate beautiful color palettes and harmonies" category="developer">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-8 text-center">
                    <label className="block text-xl font-semibold text-text-primary mb-6">Pick a Base Color</label>
                    <div className="flex justify-center gap-4 items-center">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-20 h-20 rounded-lg cursor-pointer border-4 border-bg-tertiary"
                        />
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="input w-32 text-center uppercase font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Shades</h3>
                        <div className="space-y-2">
                            {[0.9, 0.8, 0.7, 0.6, 0.5].map((opacity, i) => (
                                <div key={i} className="h-12 rounded flex items-center justify-center text-white font-mono text-sm" style={{ backgroundColor: color, opacity }}>
                                    {Math.round(opacity * 100)}%
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Tints (White Overlay)</h3>
                        <div className="space-y-2">
                            {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity, i) => (
                                <div key={i} className="h-12 rounded flex items-center justify-center text-black font-mono text-sm relative overflow-hidden">
                                    <div className="absolute inset-0" style={{ backgroundColor: color }}></div>
                                    <div className="absolute inset-0 bg-white" style={{ opacity }}></div>
                                    <span className="relative z-10">{Math.round(opacity * 100)}% White</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
