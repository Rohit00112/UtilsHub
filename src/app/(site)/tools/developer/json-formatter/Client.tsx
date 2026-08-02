'use client';

import { useState } from 'react';
import { Clipboard, Eraser, FileJson2, Minimize2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

export default function JsonFormatter() {
    const [input, setInput] = useToolState('json-formatter', 'input', '');
    const [output, setOutput] = useToolState('json-formatter', 'output', '');
    const [error, setError] = useState('');

    const processJson = (mode: 'format' | 'minify') => {
        try {
            setError('');
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, mode === 'format' ? 2 : 0));
        } catch {
            setOutput('');
            setError('Invalid JSON. Check for missing quotes, commas, or brackets.');
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setError('');
    };

    return (
        <ToolLayout title="JSON Formatter & Validator" description="Format, minify, and validate JSON data" category="developer">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    <ToolPanel title="Input JSON" actions={<button onClick={clearAll} className="btn btn-secondary h-8 gap-2 px-3"><Eraser className="h-4 w-4" />Clear</button>}>
                        <ToolTextarea
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder='{"name":"FreeWebTools"}'
                            className="min-h-[420px]"
                        />
                    </ToolPanel>

                    <ToolPanel
                        title="Output"
                        actions={output && <button onClick={() => navigator.clipboard.writeText(output)} className="btn btn-secondary h-8 gap-2 px-3"><Clipboard className="h-4 w-4" />Copy</button>}
                    >
                        <ToolTextarea
                            value={error || output}
                            readOnly
                            placeholder="Formatted JSON will appear here."
                            className="min-h-[420px]"
                        />
                    </ToolPanel>
                </div>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                <ToolActionBar className="justify-center">
                    <button onClick={() => processJson('format')} className="btn btn-primary gap-2">
                        <FileJson2 className="h-4 w-4" />
                        Beautify
                    </button>
                    <button onClick={() => processJson('minify')} className="btn btn-secondary gap-2">
                        <Minimize2 className="h-4 w-4" />
                        Minify
                    </button>
                </ToolActionBar>
            </div>
        </ToolLayout>
    );
}
