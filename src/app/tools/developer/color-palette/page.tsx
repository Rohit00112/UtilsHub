'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../../text/case-converter/case-converter.module.css';

export default function ColorPalette() {
    const [baseColor, setBaseColor] = useState('#7c3aed');
    const [palette, setPalette] = useState<any>(null);

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgbToHex = (r: number, g: number, b: number) => {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    };

    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    };

    const generatePalette = () => {
        const rgb = hexToRgb(baseColor);
        if (!rgb) return;

        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        const shades = [];
        for (let i = 0; i <= 10; i++) {
            const lightness = 95 - (i * 8.5);
            const color = `hsl(${hsl.h}, ${hsl.s}%, ${lightness}%)`;
            shades.push({ name: `${i * 100}`, color });
        }

        const complementary = `hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`;
        const analogous1 = `hsl(${(hsl.h + 30) % 360}, ${hsl.s}%, ${hsl.l}%)`;
        const analogous2 = `hsl(${(hsl.h - 30 + 360) % 360}, ${hsl.s}%, ${hsl.l}%)`;
        const triadic1 = `hsl(${(hsl.h + 120) % 360}, ${hsl.s}%, ${hsl.l}%)`;
        const triadic2 = `hsl(${(hsl.h + 240) % 360}, ${hsl.s}%, ${hsl.l}%)`;

        setPalette({
            base: baseColor,
            shades,
            complementary,
            analogous: [analogous1, analogous2],
            triadic: [triadic1, triadic2],
            hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
            rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        });
    };

    const copyColor = (color: string) => {
        navigator.clipboard.writeText(color);
    };

    return (
        <ToolLayout
            title="Color Palette Generator"
            description="Generate beautiful color palettes and harmonies from any base color"
            category="developer"
        >
            <div className={styles.tool}>
                <div className={styles.inputSection}>
                    <label className={styles.label}>Base Color</label>
                    <div className={styles.colorInputGroup}>
                        <input
                            type="color"
                            value={baseColor}
                            onChange={(e) => setBaseColor(e.target.value)}
                            className={styles.colorPicker}
                        />
                        <input
                            type="text"
                            value={baseColor}
                            onChange={(e) => setBaseColor(e.target.value)}
                            className="input"
                            placeholder="#7c3aed"
                        />
                    </div>

                    <button
                        onClick={generatePalette}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem' }}
                    >
                        🎨 Generate Palette
                    </button>
                </div>

                {palette && (
                    <div className={styles.outputSection}>
                        <div className={styles.paletteSection}>
                            <h3 className={styles.label}>Color Formats</h3>
                            <div className={styles.formatGrid}>
                                <div className={styles.formatItem} onClick={() => copyColor(palette.base)}>
                                    <span>HEX:</span>
                                    <code>{palette.base}</code>
                                </div>
                                <div className={styles.formatItem} onClick={() => copyColor(palette.rgb)}>
                                    <span>RGB:</span>
                                    <code>{palette.rgb}</code>
                                </div>
                                <div className={styles.formatItem} onClick={() => copyColor(palette.hsl)}>
                                    <span>HSL:</span>
                                    <code>{palette.hsl}</code>
                                </div>
                            </div>
                        </div>

                        <div className={styles.paletteSection}>
                            <h3 className={styles.label}>Shades & Tints</h3>
                            <div className={styles.shadesGrid}>
                                {palette.shades.map((shade: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className={styles.shadeBox}
                                        style={{ background: shade.color }}
                                        onClick={() => copyColor(shade.color)}
                                        title={`Click to copy: ${shade.color}`}
                                    >
                                        <span className={styles.shadeName}>{shade.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.paletteSection}>
                            <h3 className={styles.label}>Color Harmonies</h3>
                            <div className={styles.harmonyGrid}>
                                <div className={styles.harmonyItem}>
                                    <div className={styles.harmonyLabel}>Complementary</div>
                                    <div
                                        className={styles.harmonyColor}
                                        style={{ background: palette.complementary }}
                                        onClick={() => copyColor(palette.complementary)}
                                    />
                                </div>
                                <div className={styles.harmonyItem}>
                                    <div className={styles.harmonyLabel}>Analogous</div>
                                    <div className={styles.harmonyColors}>
                                        {palette.analogous.map((color: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className={styles.harmonyColor}
                                                style={{ background: color }}
                                                onClick={() => copyColor(color)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.harmonyItem}>
                                    <div className={styles.harmonyLabel}>Triadic</div>
                                    <div className={styles.harmonyColors}>
                                        {palette.triadic.map((color: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className={styles.harmonyColor}
                                                style={{ background: color }}
                                                onClick={() => copyColor(color)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .colorInputGroup {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .colorPicker {
          width: 80px;
          height: 50px;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .paletteSection {
          margin-bottom: 2rem;
        }

        .formatGrid {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;
        }

        .formatItem {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .formatItem:hover {
          border-color: var(--color-primary);
        }

        .formatItem code {
          color: var(--color-primary-light);
          font-family: var(--font-mono);
        }

        .shadesGrid {
          display: grid;
          grid-template-columns: repeat(11, 1fr);
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .shadeBox {
          aspect-ratio: 1;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0.5rem;
          transition: transform var(--transition-fast);
        }

        .shadeBox:hover {
          transform: scale(1.1);
        }

        .shadeName {
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .harmonyGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .harmonyItem {
          text-align: center;
        }

        .harmonyLabel {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .harmonyColor {
          height: 80px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: transform var(--transition-fast);
        }

        .harmonyColor:hover {
          transform: scale(1.05);
        }

        .harmonyColors {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .shadesGrid {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
        </ToolLayout>
    );
}
