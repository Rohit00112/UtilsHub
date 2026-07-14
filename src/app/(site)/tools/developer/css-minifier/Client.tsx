'use client';

import { useState } from 'react';
import { Clipboard, Eraser, Minimize2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';

function minifyCSS(css: string): string {
    return css
        // Remove single-line comments
        .replace(/\/\/.*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove whitespace around { } : ; , > ~ + selectors
        .replace(/\s*([{}:;,>~+])\s*/g, '$1')
        // Collapse multiple whitespace characters into one space
        .replace(/\s+/g, ' ')
        // Remove semicolons before closing braces
        .replace(/;}/g, '}')
        // Remove leading/trailing whitespace
        .trim();
}

export default function CSSMinifier() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState<{ original: number; minified: number } | null>(null);

    const handleMinify = () => {
        const result = minifyCSS(input);
        setOutput(result);
        setCopied(false);
        if (input.length > 0) {
            setStats({ original: input.length, minified: result.length });
        } else {
            setStats(null);
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setStats(null);
        setCopied(false);
    };

    const savings = stats ? Math.round((1 - stats.minified / stats.original) * 100) : 0;

    return (
        <ToolLayout title="CSS Minifier" description="Minify and compress CSS by removing whitespace and comments" category="developer">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    <ToolPanel
                        title="Input CSS"
                        actions={
                            <button onClick={clearAll} className="btn btn-secondary h-8 gap-2 px-3">
                                <Eraser className="h-4 w-4" />
                                Clear
                            </button>
                        }
                    >
                        <ToolTextarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`.container {\n  display: flex;\n  /* center children */\n  justify-content: center;\n  align-items: center;\n}`}
                            className="min-h-[420px]"
                        />
                    </ToolPanel>

                    <ToolPanel
                        title="Minified CSS"
                        actions={
                            output ? (
                                <button onClick={copyToClipboard} className="btn btn-secondary h-8 gap-2 px-3">
                                    <Clipboard className="h-4 w-4" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            ) : null
                        }
                    >
                        <ToolTextarea
                            value={output}
                            readOnly
                            placeholder="Minified CSS will appear here."
                            className="min-h-[420px]"
                        />
                    </ToolPanel>
                </div>

                {stats && stats.original > 0 && (
                    <ToolStatus tone="success">
                        Reduced from {stats.original.toLocaleString()} to {stats.minified.toLocaleString()} characters — {savings}% smaller.
                    </ToolStatus>
                )}

                <ToolActionBar className="justify-center">
                    <button onClick={handleMinify} className="btn btn-primary gap-2">
                        <Minimize2 className="h-4 w-4" />
                        Minify CSS
                    </button>
                </ToolActionBar>
            </div>
        </ToolLayout>
    );
}
