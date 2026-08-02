'use client';

import { useState } from 'react';
import format from 'xml-formatter';
import { Clipboard, Eraser, FileCode2, Minimize2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolField, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

export default function XmlFormatter() {
    const [input, setInput] = useToolState('xml-formatter', 'input', '');
    const [output, setOutput] = useToolState('xml-formatter', 'output', '');
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useToolState('xml-formatter', 'options', {
        indentation: '  ',
        collapseContent: false,
        lineSeparator: '\n',
    });

    const handleFormat = () => {
        try {
            setError(null);
            if (!input.trim()) {
                setOutput('');
                return;
            }
            setOutput(format(input, options));
        } catch (err) {
            setOutput('');
            setError('Invalid XML: ' + (err as Error).message);
        }
    };

    const handleMinify = () => {
        try {
            setError(null);
            if (!input.trim()) {
                setOutput('');
                return;
            }
            setOutput(format(input, { indentation: '', lineSeparator: '', collapseContent: true }));
        } catch (err) {
            setOutput('');
            setError('Invalid XML: ' + (err as Error).message);
        }
    };

    return (
        <ToolLayout title="XML Formatter" description="Format, validate, and minify XML data" category="developer">
            <div className="mx-auto max-w-6xl space-y-6">
                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                <div className="grid gap-4 lg:grid-cols-2">
                    <ToolPanel
                        title="Input XML"
                        actions={<button onClick={() => setInput('')} className="btn btn-secondary h-8 gap-2 px-3"><Eraser className="h-4 w-4" />Clear</button>}
                    >
                        <ToolTextarea
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            className="min-h-[420px]"
                            placeholder="Paste XML here"
                        />
                    </ToolPanel>

                    <ToolPanel
                        title="Formatted XML"
                        actions={output && <button onClick={() => navigator.clipboard.writeText(output)} className="btn btn-secondary h-8 gap-2 px-3"><Clipboard className="h-4 w-4" />Copy</button>}
                    >
                        <ToolTextarea
                            value={output}
                            readOnly
                            className="min-h-[420px]"
                            placeholder="Formatted output will appear here"
                        />
                    </ToolPanel>
                </div>

                <ToolPanel title="Formatting options">
                    <div className="grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
                        <ToolField label="Indentation">
                            <select
                                value={options.indentation}
                                onChange={(event) => setOptions({ ...options, indentation: event.target.value })}
                                className="input"
                            >
                                <option value="  ">2 spaces</option>
                                <option value="    ">4 spaces</option>
                                <option value="	">Tab</option>
                            </select>
                        </ToolField>
                        <label className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={options.collapseContent}
                                onChange={(event) => setOptions({ ...options, collapseContent: event.target.checked })}
                                className="h-4 w-4 rounded border-border"
                            />
                            Collapse content
                        </label>
                        <ToolActionBar>
                            <button onClick={handleMinify} className="btn btn-secondary gap-2">
                                <Minimize2 className="h-4 w-4" />
                                Minify
                            </button>
                            <button onClick={handleFormat} className="btn btn-primary gap-2">
                                <FileCode2 className="h-4 w-4" />
                                Format XML
                            </button>
                        </ToolActionBar>
                    </div>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
