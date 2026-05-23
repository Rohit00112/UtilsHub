'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolField, ToolPanel, ToolResultCard } from '@/components/tools/ToolPrimitives';

export default function ColorPalette() {
    const [color, setColor] = useState('#111827');

    return (
        <ToolLayout title="Color Palette Generator" description="Generate simple shades and tints from a base color" category="developer">
            <div className="mx-auto max-w-4xl space-y-6">
                <ToolPanel title="Base color" description="Pick a color and inspect practical shade/tint steps.">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <ToolField label="Color">
                            <input
                                type="color"
                                value={color}
                                onChange={(event) => setColor(event.target.value)}
                                className="h-12 w-20 cursor-pointer rounded-md border border-input bg-background p-1"
                            />
                        </ToolField>
                        <ToolField label="Hex value" className="sm:w-40">
                            <input
                                type="text"
                                value={color}
                                onChange={(event) => setColor(event.target.value)}
                                className="input font-mono uppercase"
                            />
                        </ToolField>
                        <div className="flex h-12 flex-1 items-center rounded-md border px-4 font-mono text-sm text-white" style={{ backgroundColor: color }}>
                            <Palette className="mr-2 h-4 w-4" />
                            {color.toUpperCase()}
                        </div>
                    </div>
                </ToolPanel>

                <div className="grid gap-4 md:grid-cols-2">
                    <ToolPanel title="Shades">
                        <div className="space-y-2">
                            {[0.9, 0.8, 0.7, 0.6, 0.5].map((opacity) => (
                                <ToolResultCard key={opacity} title={`${Math.round(opacity * 100)}%`} className="p-0">
                                    <div className="h-12 rounded-md" style={{ backgroundColor: color, opacity }} />
                                </ToolResultCard>
                            ))}
                        </div>
                    </ToolPanel>
                    <ToolPanel title="Tints">
                        <div className="space-y-2">
                            {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                                <ToolResultCard key={opacity} title={`${Math.round(opacity * 100)}% white`} className="p-0">
                                    <div className="relative h-12 overflow-hidden rounded-md">
                                        <div className="absolute inset-0" style={{ backgroundColor: color }} />
                                        <div className="absolute inset-0 bg-white" style={{ opacity }} />
                                    </div>
                                </ToolResultCard>
                            ))}
                        </div>
                    </ToolPanel>
                </div>
            </div>
        </ToolLayout>
    );
}
