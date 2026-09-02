'use client';

import { useCallback, useMemo, useState } from 'react';
import { Check, Clipboard, Palette, RefreshCw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolField,
    ToolPanel,
    ToolStatus,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

/* ------------------------------------------------------------------ */
/*  Color math helpers                                                  */
/* ------------------------------------------------------------------ */

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex: string): [number, number, number] | null {
    const h = hex.replace(/^#/, '').replace(/[^0-9a-fA-F]/g, '');
    if (h.length === 3) {
        return [
            parseInt(h[0] + h[0], 16),
            parseInt(h[1] + h[1], 16),
            parseInt(h[2] + h[2], 16),
        ];
    }
    if (h.length >= 6) {
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
        return [r, g, b];
    }
    return null;
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        else if (max === gn) h = ((bn - rn) / d + 2) / 6;
        else h = ((rn - gn) / d + 4) / 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const sn = s / 100, ln = l / 100;
    const c = (1 - Math.abs(2 * ln - 1)) * sn;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = ln - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255),
    ];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const k = 1 - Math.max(rn, gn, bn);
    if (k === 1) return [0, 0, 0, 100];
    const c = (1 - rn - k) / (1 - k);
    const m = (1 - gn - k) / (1 - k);
    const y = (1 - bn - k) / (1 - k);
    return [
        Math.round(c * 100),
        Math.round(m * 100),
        Math.round(y * 100),
        Math.round(k * 100),
    ];
}

function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
    const cn = c / 100, mn = m / 100, yn = y / 100, kn = k / 100;
    return [
        Math.round(255 * (1 - cn) * (1 - kn)),
        Math.round(255 * (1 - mn) * (1 - kn)),
        Math.round(255 * (1 - yn) * (1 - kn)),
    ];
}

function textColor(hex: string): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.55 ? '#000000' : '#ffffff';
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };
    return (
        <button
            type="button"
            onClick={copy}
            title={`Copy ${label ?? text}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : (label ?? 'Copy')}
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ColorConverter() {
    const [hex, setHex] = useToolState('color-converter', 'hex', '#6366f1');

    const rgb = useMemo<[number, number, number]>(() => hexToRgb(hex) ?? [99, 102, 241], [hex]);
    const hsl = useMemo(() => rgbToHsl(...rgb), [rgb]);
    const cmyk = useMemo(() => rgbToCmyk(...rgb), [rgb]);

    const hexStr = useMemo(() => hex.startsWith('#') ? hex.toUpperCase() : `#${hex}`.toUpperCase(), [hex]);
    const rgbStr = useMemo(() => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, [rgb]);
    const hslStr = useMemo(() => `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`, [hsl]);
    const cmykStr = useMemo(() => `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)`, [cmyk]);

    const updateFromHex = useCallback((value: string) => {
        let v = value.trim();
        if (!v.startsWith('#')) v = `#${v}`;
        setHex(v);
    }, [setHex]);

    const updateFromRgb = useCallback((r: number, g: number, b: number) => {
        setHex(rgbToHex(clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)));
    }, [setHex]);

    const updateFromHsl = useCallback((h: number, s: number, l: number) => {
        const [r, g, b] = hslToRgb(clamp(h, 0, 360), clamp(s, 0, 100), clamp(l, 0, 100));
        setHex(rgbToHex(r, g, b));
    }, [setHex]);

    const updateFromCmyk = useCallback((c: number, m: number, y: number, k: number) => {
        const [r, g, b] = cmykToRgb(clamp(c, 0, 100), clamp(m, 0, 100), clamp(y, 0, 100), clamp(k, 0, 100));
        setHex(rgbToHex(r, g, b));
    }, [setHex]);

    const randomColor = useCallback(() => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        setHex(rgbToHex(r, g, b));
    }, [setHex]);

    const validHex = hexToRgb(hex) !== null;

    return (
        <ToolLayout title="Color Converter" description="Convert colors between HEX, RGB, HSL, and CMYK formats" category="developer">
            <div className="mx-auto max-w-5xl space-y-8">

                {/* ── Color Preview ──────────────────────────────── */}
                <ToolPanel title="Color preview">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <ToolField label="Color picker">
                            <input
                                type="color"
                                value={validHex ? hexStr : '#000000'}
                                onChange={(e) => setHex(e.target.value)}
                                className="h-14 w-24 cursor-pointer rounded-xl border border-input bg-background p-1.5 transition-shadow hover:shadow-md"
                            />
                        </ToolField>
                        <div
                            className="flex h-14 flex-1 items-center gap-3 rounded-xl border px-5 font-mono text-sm transition-shadow hover:shadow-md"
                            style={{ backgroundColor: validHex ? hexStr : '#000000', color: textColor(validHex ? hexStr : '#000000') }}
                        >
                            <Palette className="h-5 w-5" />
                            <span>{validHex ? hexStr : 'Invalid color'}</span>
                        </div>
                        <button type="button" onClick={randomColor} className="btn btn-secondary gap-2 h-14 px-5">
                            <RefreshCw className="h-4 w-4" />
                            Random
                        </button>
                    </div>
                </ToolPanel>

                {!validHex && <ToolStatus tone="warning">Enter a valid hex color (e.g. #6366f1 or #f00).</ToolStatus>}

                {/* ── Format Panels ──────────────────────────────── */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* HEX */}
                    <ToolPanel title="HEX" actions={<CopyButton text={hexStr} label="Copy HEX" />}>
                        <ToolField label="Hex value">
                            <input
                                type="text"
                                value={hex}
                                onChange={(e) => updateFromHex(e.target.value)}
                                placeholder="#6366f1"
                                className="input font-mono uppercase"
                            />
                        </ToolField>
                    </ToolPanel>

                    {/* RGB */}
                    <ToolPanel title="RGB" actions={<CopyButton text={rgbStr} label="Copy RGB" />}>
                        <div className="grid grid-cols-3 gap-3">
                            <ToolField label="R (0–255)">
                                <input
                                    type="number" min={0} max={255}
                                    value={rgb[0]}
                                    onChange={(e) => updateFromRgb(Number(e.target.value), rgb[1], rgb[2])}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="G (0–255)">
                                <input
                                    type="number" min={0} max={255}
                                    value={rgb[1]}
                                    onChange={(e) => updateFromRgb(rgb[0], Number(e.target.value), rgb[2])}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="B (0–255)">
                                <input
                                    type="number" min={0} max={255}
                                    value={rgb[2]}
                                    onChange={(e) => updateFromRgb(rgb[0], rgb[1], Number(e.target.value))}
                                    className="input font-mono"
                                />
                            </ToolField>
                        </div>
                        <p className="mt-2 rounded-lg bg-muted/30 px-3 py-2 font-mono text-sm text-muted-foreground">{rgbStr}</p>
                    </ToolPanel>

                    {/* HSL */}
                    <ToolPanel title="HSL" actions={<CopyButton text={hslStr} label="Copy HSL" />}>
                        <div className="grid grid-cols-3 gap-3">
                            <ToolField label="H (0–360)">
                                <input
                                    type="number" min={0} max={360}
                                    value={hsl[0]}
                                    onChange={(e) => updateFromHsl(Number(e.target.value), hsl[1], hsl[2])}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="S (0–100)">
                                <input
                                    type="number" min={0} max={100}
                                    value={hsl[1]}
                                    onChange={(e) => updateFromHsl(hsl[0], Number(e.target.value), hsl[2])}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="L (0–100)">
                                <input
                                    type="number" min={0} max={100}
                                    value={hsl[2]}
                                    onChange={(e) => updateFromHsl(hsl[0], hsl[1], Number(e.target.value))}
                                    className="input font-mono"
                                />
                            </ToolField>
                        </div>
                        <p className="mt-2 rounded-lg bg-muted/30 px-3 py-2 font-mono text-sm text-muted-foreground">{hslStr}</p>
                    </ToolPanel>

                    {/* CMYK */}
                    <ToolPanel title="CMYK" actions={<CopyButton text={cmykStr} label="Copy CMYK" />}>
                        <div className="grid grid-cols-4 gap-3">
                            <ToolField label="C (%)">
                                <input
                                    type="number" min={0} max={100}
                                    value={cmyk[0]}
                                    onChange={(e) => updateFromCmyk(Number(e.target.value), cmyk[1], cmyk[2], cmyk[3])}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="M (%)">
                                <input
                                    type="number" min={0} max={100}
                                    value={cmyk[1]}
                                    onChange={(e) => updateFromCmyk(cmyk[0], Number(e.target.value), cmyk[2], cmyk[3])}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="Y (%)">
                                <input
                                    type="number" min={0} max={100}
                                    value={cmyk[2]}
                                    onChange={(e) => updateFromCmyk(cmyk[0], cmyk[1], Number(e.target.value), cmyk[3])}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="K (%)">
                                <input
                                    type="number" min={0} max={100}
                                    value={cmyk[3]}
                                    onChange={(e) => updateFromCmyk(cmyk[0], cmyk[1], cmyk[2], Number(e.target.value))}
                                    className="input font-mono"
                                />
                            </ToolField>
                        </div>
                        <p className="mt-2 rounded-lg bg-muted/30 px-3 py-2 font-mono text-sm text-muted-foreground">{cmykStr}</p>
                    </ToolPanel>
                </div>

                {/* ── All formats summary ────────────────────────── */}
                <ToolPanel title="All formats">
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Format</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Value</th>
                                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Copy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: 'HEX', value: hexStr },
                                    { label: 'RGB', value: rgbStr },
                                    { label: 'HSL', value: hslStr },
                                    { label: 'CMYK', value: cmykStr },
                                ].map((row) => (
                                    <tr key={row.label} className="border-b last:border-b-0 transition-colors hover:bg-muted/20">
                                        <td className="px-4 py-3 font-semibold text-foreground">{row.label}</td>
                                        <td className="px-4 py-3 font-mono text-foreground">{row.value}</td>
                                        <td className="px-4 py-3 text-right">
                                            <CopyButton text={row.value} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
