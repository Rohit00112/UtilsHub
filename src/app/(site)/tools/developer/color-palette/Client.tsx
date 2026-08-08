'use client';

import { useCallback, useMemo, useState } from 'react';
import {
    Check,
    Clipboard,
    Code2,
    Palette,
    RefreshCw,
} from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

interface HSL {
    h: number; // 0–360
    s: number; // 0–100
    l: number; // 0–100
}

function hexToHsl(hex: string): HSL {
    let r = 0, g = 0, b = 0;
    const h6 = hex.replace(/^#/, '').replace(/[^0-9a-fA-F]/g, '');
    if (h6.length === 3) {
        r = parseInt(h6[0] + h6[0], 16) / 255;
        g = parseInt(h6[1] + h6[1], 16) / 255;
        b = parseInt(h6[2] + h6[2], 16) / 255;
    } else if (h6.length >= 6) {
        r = parseInt(h6.slice(0, 2), 16) / 255;
        g = parseInt(h6.slice(2, 4), 16) / 255;
        b = parseInt(h6.slice(4, 6), 16) / 255;
    } else {
        return { h: 0, s: 0, l: 0 };
    }
    if (isNaN(r) || isNaN(g) || isNaN(b)) return { h: 0, s: 0, l: 0 };
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let hue = 0, sat = 0;
    if (max !== min) {
        const d = max - min;
        sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) hue = ((b - r) / d + 2) / 6;
        else hue = ((r - g) / d + 4) / 6;
    }
    return { h: Math.round(hue * 360), s: Math.round(sat * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
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
    const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hslToRgb(h: number, s: number, l: number): string {
    const hex = hslToHex(h, s, l).replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

function hslString(h: number, s: number, l: number): string {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function wrapHue(h: number): number {
    return ((h % 360) + 360) % 360;
}

function textColor(hex: string): string {
    const h6 = hex.replace('#', '');
    const r = parseInt(h6.slice(0, 2), 16);
    const g = parseInt(h6.slice(2, 4), 16);
    const b = parseInt(h6.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#000000' : '#ffffff';
}

/* ------------------------------------------------------------------ */
/*  Shade/tint scale                                                   */
/* ------------------------------------------------------------------ */

interface ColorSwatch {
    label: string;
    hex: string;
    h: number;
    s: number;
    l: number;
}

function generateScale(baseHsl: HSL): ColorSwatch[] {
    const steps = [
        { label: '50', l: 97 },
        { label: '100', l: 93 },
        { label: '200', l: 86 },
        { label: '300', l: 74 },
        { label: '400', l: 62 },
        { label: '500', l: 50 },
        { label: '600', l: 42 },
        { label: '700', l: 34 },
        { label: '800', l: 26 },
        { label: '900', l: 18 },
        { label: '950', l: 10 },
    ];
    return steps.map(({ label, l }) => {
        // Adjust saturation slightly based on lightness to feel natural
        const satAdjust = l > 80 ? baseHsl.s * 0.75 : l < 25 ? baseHsl.s * 0.85 : baseHsl.s;
        const hex = hslToHex(baseHsl.h, Math.min(100, Math.round(satAdjust)), l);
        return { label, hex, h: baseHsl.h, s: Math.min(100, Math.round(satAdjust)), l };
    });
}

/* ------------------------------------------------------------------ */
/*  Harmony modes                                                      */
/* ------------------------------------------------------------------ */

type HarmonyMode = 'monochromatic' | 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic';

interface HarmonyColor {
    label: string;
    hex: string;
    hsl: HSL;
}

function getHarmonyColors(baseHsl: HSL, mode: HarmonyMode): HarmonyColor[] {
    const { h, s, l } = baseHsl;
    const make = (label: string, hue: number): HarmonyColor => {
        const wrapped = wrapHue(hue);
        return { label, hex: hslToHex(wrapped, s, l), hsl: { h: wrapped, s, l } };
    };

    switch (mode) {
        case 'monochromatic':
            return [
                make('Base', h),
                { label: 'Light', hex: hslToHex(h, s, Math.min(95, l + 20)), hsl: { h, s, l: Math.min(95, l + 20) } },
                { label: 'Lighter', hex: hslToHex(h, s, Math.min(95, l + 35)), hsl: { h, s, l: Math.min(95, l + 35) } },
                { label: 'Dark', hex: hslToHex(h, s, Math.max(5, l - 20)), hsl: { h, s, l: Math.max(5, l - 20) } },
                { label: 'Darker', hex: hslToHex(h, s, Math.max(5, l - 35)), hsl: { h, s, l: Math.max(5, l - 35) } },
            ];
        case 'complementary':
            return [make('Base', h), make('Complement', h + 180)];
        case 'analogous':
            return [make('Base', h), make('Analogous −30°', h - 30), make('Analogous +30°', h + 30)];
        case 'triadic':
            return [make('Base', h), make('Triadic +120°', h + 120), make('Triadic +240°', h + 240)];
        case 'split-complementary':
            return [make('Base', h), make('Split −150°', h + 150), make('Split +150°', h + 210)];
        case 'tetradic':
            return [make('Base', h), make('Tetradic +90°', h + 90), make('Tetradic +180°', h + 180), make('Tetradic +270°', h + 270)];
    }
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text, className }: { text: string; className?: string }) {
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
            title={`Copy ${text}`}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-mono transition-all hover:bg-black/10 dark:hover:bg-white/10 ${className ?? ''}`}
        >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Clipboard className="h-3 w-3 opacity-50" />}
            <span>{text}</span>
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  Export generators                                                   */
/* ------------------------------------------------------------------ */

function generateCssExport(scale: ColorSwatch[], harmonyColors: HarmonyColor[]): string {
    const lines = [':root {'];
    scale.forEach(sw => {
        lines.push(`  --color-${sw.label}: ${sw.hex};`);
    });
    lines.push('');
    harmonyColors.forEach((hc, i) => {
        const name = hc.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        lines.push(`  --harmony-${name || i}: ${hc.hex};`);
    });
    lines.push('}');
    return lines.join('\n');
}

function generateTailwindExport(scale: ColorSwatch[]): string {
    const lines = [
        '// tailwind.config.js',
        'module.exports = {',
        '  theme: {',
        '    extend: {',
        '      colors: {',
        "        brand: {",
    ];
    scale.forEach(sw => {
        lines.push(`          '${sw.label}': '${sw.hex}',`);
    });
    lines.push('        },');
    lines.push('      },');
    lines.push('    },');
    lines.push('  },');
    lines.push('};');
    return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const harmonyModes: Array<{ label: string; value: HarmonyMode }> = [
    { label: 'Monochromatic', value: 'monochromatic' },
    { label: 'Complementary', value: 'complementary' },
    { label: 'Analogous', value: 'analogous' },
    { label: 'Triadic', value: 'triadic' },
    { label: 'Split-Comp', value: 'split-complementary' },
    { label: 'Tetradic', value: 'tetradic' },
];

type ExportMode = 'css' | 'tailwind';

export default function ColorPalette() {
    const [color, setColor] = useToolState('color-palette', 'color', '#6366f1');
    const [harmony, setHarmony] = useToolState<HarmonyMode>('color-palette', 'harmony', 'analogous');
    const [exportMode, setExportMode] = useToolState<ExportMode>('color-palette', 'exportMode', 'css');
    const [copied, setCopied] = useState(false);

    const baseHsl = useMemo(() => hexToHsl(color), [color]);
    const scale = useMemo(() => generateScale(baseHsl), [baseHsl]);
    const harmonyColors = useMemo(() => getHarmonyColors(baseHsl, harmony), [baseHsl, harmony]);

    const exportCode = useMemo(
        () => exportMode === 'css' ? generateCssExport(scale, harmonyColors) : generateTailwindExport(scale),
        [scale, harmonyColors, exportMode],
    );

    const randomColor = useCallback(() => {
        const h = Math.floor(Math.random() * 360);
        const s = 50 + Math.floor(Math.random() * 40);
        const l = 40 + Math.floor(Math.random() * 20);
        setColor(hslToHex(h, s, l));
    }, [setColor]);

    const copyExport = () => {
        navigator.clipboard.writeText(exportCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <ToolLayout title="Color Palette Generator" description="Generate harmonious palettes, shade scales, and export CSS or Tailwind config from a base color" category="developer">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* ── Base Color Picker ───────────────────────── */}
                <ToolPanel title="Base color" description="Pick a base color or enter a hex value. The entire palette derives from this.">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <ToolField label="Color picker">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="h-14 w-24 cursor-pointer rounded-xl border border-input bg-background p-1.5 transition-shadow hover:shadow-md"
                            />
                        </ToolField>
                        <ToolField label="Hex" className="sm:w-36">
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="input font-mono uppercase"
                            />
                        </ToolField>
                        <div className="flex h-14 flex-1 items-center gap-3 rounded-xl border px-5 font-mono text-sm transition-shadow hover:shadow-md" style={{ backgroundColor: color, color: textColor(color) }}>
                            <Palette className="h-5 w-5" />
                            <span>H: {baseHsl.h}° &nbsp; S: {baseHsl.s}% &nbsp; L: {baseHsl.l}%</span>
                        </div>
                        <button type="button" onClick={randomColor} className="btn btn-secondary gap-2 h-14 px-5">
                            <RefreshCw className="h-4 w-4" />
                            Random
                        </button>
                    </div>
                </ToolPanel>

                {/* ── Shade/Tint Scale ────────────────────────── */}
                <ToolPanel title="Shade scale" description="A Tailwind-style 11-step scale from lightest to darkest, generated from your base color.">
                    {/* Continuous color strip */}
                    <div className="flex overflow-hidden rounded-2xl border border-border/50">
                        {scale.map((sw) => (
                            <div
                                key={sw.label}
                                className="group relative flex-1 h-20 sm:h-24 transition-all hover:flex-[2] cursor-pointer"
                                style={{ backgroundColor: sw.hex }}
                                onClick={() => navigator.clipboard.writeText(sw.hex.toUpperCase())}
                                title={`Click to copy ${sw.hex.toUpperCase()}`}
                            >
                                <span
                                    className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold opacity-80 transition-opacity group-hover:opacity-100"
                                    style={{ color: textColor(sw.hex) }}
                                >
                                    {sw.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Shade details table */}
                    <div className="mt-4 overflow-x-auto rounded-xl border">
                        <table className="w-full text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Step</th>
                                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Preview</th>
                                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">HEX</th>
                                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground hidden sm:table-cell">HSL</th>
                                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground hidden md:table-cell">RGB</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scale.map((sw) => (
                                    <tr key={sw.label} className="border-b last:border-b-0 transition-colors hover:bg-muted/20">
                                        <td className="px-3 py-2 font-semibold text-foreground">{sw.label}</td>
                                        <td className="px-3 py-2">
                                            <div className="h-7 w-14 rounded-md border border-border/50" style={{ backgroundColor: sw.hex }} />
                                        </td>
                                        <td className="px-3 py-2">
                                            <CopyButton text={sw.hex.toUpperCase()} />
                                        </td>
                                        <td className="px-3 py-2 hidden sm:table-cell">
                                            <CopyButton text={hslString(sw.h, sw.s, sw.l)} />
                                        </td>
                                        <td className="px-3 py-2 hidden md:table-cell">
                                            <CopyButton text={hslToRgb(sw.h, sw.s, sw.l)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ToolPanel>

                {/* ── Harmony Mode ────────────────────────────── */}
                <ToolPanel title="Color harmony" description="Select a harmony mode to see colors that pair well with your base.">
                    <div className="mb-6">
                        <ToolSegmentedControl value={harmony} onChange={setHarmony} options={harmonyModes} />
                    </div>

                    {/* Harmony color swatches */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {harmonyColors.map((hc) => (
                            <div key={hc.label} className="group overflow-hidden rounded-2xl border border-border/50 transition-all hover:shadow-lg">
                                <div
                                    className="flex h-28 sm:h-32 items-end p-4"
                                    style={{ backgroundColor: hc.hex, color: textColor(hc.hex) }}
                                >
                                    <div>
                                        <div className="text-xs font-medium opacity-75">{hc.label}</div>
                                        <div className="text-lg font-bold">{hc.hex.toUpperCase()}</div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 bg-card p-3">
                                    <CopyButton text={hc.hex.toUpperCase()} />
                                    <CopyButton text={hslString(hc.hsl.h, hc.hsl.s, hc.hsl.l)} />
                                    <CopyButton text={hslToRgb(hc.hsl.h, hc.hsl.s, hc.hsl.l)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Visual harmony ring */}
                    <div className="mt-6 flex justify-center">
                        <div className="relative h-48 w-48 sm:h-56 sm:w-56">
                            <svg viewBox="0 0 200 200" className="h-full w-full">
                                {/* Hue wheel */}
                                <defs>
                                    <linearGradient id="hue-arc" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="hsl(0, 80%, 50%)" />
                                        <stop offset="17%" stopColor="hsl(60, 80%, 50%)" />
                                        <stop offset="33%" stopColor="hsl(120, 80%, 50%)" />
                                        <stop offset="50%" stopColor="hsl(180, 80%, 50%)" />
                                        <stop offset="67%" stopColor="hsl(240, 80%, 50%)" />
                                        <stop offset="83%" stopColor="hsl(300, 80%, 50%)" />
                                        <stop offset="100%" stopColor="hsl(360, 80%, 50%)" />
                                    </linearGradient>
                                </defs>
                                <circle cx="100" cy="100" r="90" fill="none" stroke="url(#hue-arc)" strokeWidth="12" opacity="0.2" />
                                {/* Harmony dots connected by lines */}
                                {harmonyColors.length > 1 && (
                                    <polygon
                                        points={harmonyColors.map(hc => {
                                            const hue = isNaN(hc.hsl.h) ? 0 : hc.hsl.h;
                                            const angle = ((hue - 90) * Math.PI) / 180;
                                            return `${100 + 70 * Math.cos(angle)},${100 + 70 * Math.sin(angle)}`;
                                        }).join(' ')}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        opacity="0.3"
                                        className="text-foreground"
                                    />
                                )}
                                {harmonyColors.map((hc, i) => {
                                    const hue = isNaN(hc.hsl.h) ? 0 : hc.hsl.h;
                                    const angle = ((hue - 90) * Math.PI) / 180;
                                    const cx = 100 + 70 * Math.cos(angle);
                                    const cy = 100 + 70 * Math.sin(angle);
                                    return (
                                        <circle
                                            key={i}
                                            cx={cx}
                                            cy={cy}
                                            r={i === 0 ? 12 : 9}
                                            fill={hc.hex}
                                            stroke={textColor(hc.hex)}
                                            strokeWidth="2"
                                            className="transition-all"
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </ToolPanel>

                {/* ── Export ──────────────────────────────────── */}
                <ToolPanel title="Export palette" description="Copy the palette as CSS custom properties or a Tailwind config snippet.">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <ToolSegmentedControl
                            value={exportMode}
                            onChange={setExportMode}
                            options={[
                                { label: 'CSS Variables', value: 'css' },
                                { label: 'Tailwind Config', value: 'tailwind' },
                            ]}
                        />
                        <ToolActionBar>
                            <button type="button" onClick={copyExport} className="btn btn-primary gap-2 h-9 px-4">
                                {copied ? <Check className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                                {copied ? 'Copied!' : 'Copy code'}
                            </button>
                        </ToolActionBar>
                    </div>
                    <pre className="overflow-auto rounded-xl border bg-muted/30 p-4 text-sm font-mono leading-relaxed text-foreground">
                        {exportCode}
                    </pre>
                </ToolPanel>

                {copied && (
                    <ToolStatus tone="success">
                        Export code copied to clipboard.
                    </ToolStatus>
                )}
            </div>
        </ToolLayout>
    );
}
