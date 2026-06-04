'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Plus, Trash2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolField, ToolPanel, ToolSegmentedControl } from '@/components/tools/ToolPrimitives';

type GradType = 'linear' | 'radial';

interface Stop {
    id: number;
    color: string;
    pos: number;
}

const typeOptions: Array<{ label: string; value: GradType }> = [
    { label: 'Linear', value: 'linear' },
    { label: 'Radial', value: 'radial' },
];

let nextId = 3;

export default function CssGradientGenerator() {
    const [type, setType] = useState<GradType>('linear');
    const [angle, setAngle] = useState(90);
    const [stops, setStops] = useState<Stop[]>([
        { id: 1, color: '#6366f1', pos: 0 },
        { id: 2, color: '#ec4899', pos: 100 },
    ]);
    const [copied, setCopied] = useState(false);

    const css = useMemo(() => {
        const ordered = [...stops].sort((a, b) => a.pos - b.pos);
        const stopStr = ordered.map((s) => `${s.color} ${s.pos}%`).join(', ');
        return type === 'linear'
            ? `linear-gradient(${angle}deg, ${stopStr})`
            : `radial-gradient(circle, ${stopStr})`;
    }, [type, angle, stops]);

    const fullCss = `background-image: ${css};`;

    const updateStop = (id: number, patch: Partial<Stop>) => {
        setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    };

    const addStop = () => {
        setStops((prev) => [...prev, { id: nextId++, color: '#22d3ee', pos: 50 }]);
    };

    const removeStop = (id: number) => {
        setStops((prev) => (prev.length > 2 ? prev.filter((s) => s.id !== id) : prev));
    };

    const copyCss = async () => {
        await navigator.clipboard.writeText(fullCss);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    return (
        <ToolLayout title="CSS Gradient Generator" description="Design linear and radial CSS gradients with a live preview" category="web">
            <div className="mx-auto max-w-5xl space-y-6">
                <div
                    className="h-48 w-full rounded-lg border"
                    style={{ backgroundImage: css }}
                    aria-label="Gradient preview"
                />

                <ToolPanel title="Gradient settings">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <ToolField label="Type">
                            <ToolSegmentedControl value={type} options={typeOptions} onChange={setType} />
                        </ToolField>
                        {type === 'linear' && (
                            <ToolField label={`Angle: ${angle}°`} htmlFor="angle">
                                <input
                                    id="angle"
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={angle}
                                    onChange={(e) => setAngle(Number(e.target.value))}
                                    className="w-full accent-current"
                                />
                            </ToolField>
                        )}
                    </div>
                </ToolPanel>

                <ToolPanel title="Color stops" description="Add stops and set each color and position.">
                    <div className="space-y-3">
                        {stops.map((stop) => (
                            <div key={stop.id} className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/20 p-3">
                                <input
                                    type="color"
                                    value={stop.color}
                                    onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                                    className="h-10 w-12 cursor-pointer rounded border bg-transparent"
                                    aria-label="Stop color"
                                />
                                <input
                                    type="text"
                                    value={stop.color}
                                    onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                                    className="input h-10 w-32 font-mono"
                                    spellCheck={false}
                                />
                                <div className="flex flex-1 items-center gap-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={stop.pos}
                                        onChange={(e) => updateStop(stop.id, { pos: Number(e.target.value) })}
                                        className="flex-1 accent-current"
                                        aria-label="Stop position"
                                    />
                                    <span className="w-12 text-right text-sm tabular-nums text-muted-foreground">{stop.pos}%</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeStop(stop.id)}
                                    disabled={stops.length <= 2}
                                    className="btn btn-secondary h-10 gap-2"
                                    aria-label="Remove stop"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <button type="button" onClick={addStop} className="btn btn-secondary gap-2">
                            <Plus className="h-4 w-4" />
                            Add stop
                        </button>
                    </div>
                </ToolPanel>

                <ToolPanel title="CSS">
                    <div className="flex items-start justify-between gap-3 rounded-md border bg-muted/20 p-4">
                        <code className="break-all font-mono text-sm text-foreground">{fullCss}</code>
                        <button type="button" onClick={copyCss} className="btn btn-primary shrink-0 gap-2">
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
