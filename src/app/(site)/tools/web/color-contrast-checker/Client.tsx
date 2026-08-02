'use client';

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolField, ToolMetric, ToolPanel } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

function parseHex(hex: string): [number, number, number] | null {
    let h = hex.trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance([r, g, b]: [number, number, number]) {
    const srgb = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(c1: [number, number, number], c2: [number, number, number]) {
    const l1 = relativeLuminance(c1);
    const l2 = relativeLuminance(c2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

function Badge({ pass, label }: { pass: boolean; label: string }) {
    return (
        <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${pass ? 'border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-destructive/40 bg-destructive/10 text-destructive'}`}>
            {pass ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {label}: {pass ? 'Pass' : 'Fail'}
        </div>
    );
}

export default function ColorContrastChecker() {
    const [text, setText] = useToolState('color-contrast-checker', 'text', '#1e293b');
    const [bg, setBg] = useToolState('color-contrast-checker', 'bg', '#f8fafc');

    const data = useMemo(() => {
        const tc = parseHex(text);
        const bc = parseHex(bg);
        if (!tc || !bc) return null;
        const ratio = contrastRatio(tc, bc);
        return {
            ratio,
            aaNormal: ratio >= 4.5,
            aaLarge: ratio >= 3,
            aaaNormal: ratio >= 7,
            aaaLarge: ratio >= 4.5,
        };
    }, [text, bg]);

    const validText = parseHex(text) !== null;
    const validBg = parseHex(bg) !== null;

    return (
        <ToolLayout title="Color Contrast Checker" description="Check text and background contrast against WCAG AA and AAA" category="web">
            <div className="mx-auto max-w-4xl space-y-6">
                <ToolPanel title="Colors">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <ToolField label="Text color" htmlFor="text-color">
                            <div className="flex items-center gap-2">
                                <input type="color" value={parseHex(text) ? text : '#000000'} onChange={(e) => setText(e.target.value)} className="h-10 w-12 cursor-pointer rounded border bg-transparent" aria-label="Pick text color" />
                                <input id="text-color" type="text" value={text} onChange={(e) => setText(e.target.value)} className={`input h-10 flex-1 font-mono ${validText ? '' : 'border-destructive'}`} spellCheck={false} />
                            </div>
                        </ToolField>
                        <ToolField label="Background color" htmlFor="bg-color">
                            <div className="flex items-center gap-2">
                                <input type="color" value={parseHex(bg) ? bg : '#ffffff'} onChange={(e) => setBg(e.target.value)} className="h-10 w-12 cursor-pointer rounded border bg-transparent" aria-label="Pick background color" />
                                <input id="bg-color" type="text" value={bg} onChange={(e) => setBg(e.target.value)} className={`input h-10 flex-1 font-mono ${validBg ? '' : 'border-destructive'}`} spellCheck={false} />
                            </div>
                        </ToolField>
                    </div>
                </ToolPanel>

                {data ? (
                    <>
                        <div
                            className="rounded-lg border p-8"
                            style={{ backgroundColor: bg, color: text }}
                        >
                            <p className="text-base">Normal text — the quick brown fox jumps over the lazy dog.</p>
                            <p className="mt-2 text-2xl font-bold">Large text — readable preview.</p>
                        </div>

                        <ToolMetric label="Contrast ratio" value={`${data.ratio.toFixed(2)} : 1`} />

                        <ToolPanel title="WCAG results">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Badge pass={data.aaNormal} label="AA Normal (4.5:1)" />
                                <Badge pass={data.aaLarge} label="AA Large (3:1)" />
                                <Badge pass={data.aaaNormal} label="AAA Normal (7:1)" />
                                <Badge pass={data.aaaLarge} label="AAA Large (4.5:1)" />
                            </div>
                        </ToolPanel>
                    </>
                ) : (
                    <ToolPanel title="WCAG results">
                        <p className="text-sm text-destructive">Enter valid hex colors (e.g. #1e293b or #abc) to see the contrast ratio.</p>
                    </ToolPanel>
                )}
            </div>
        </ToolLayout>
    );
}
