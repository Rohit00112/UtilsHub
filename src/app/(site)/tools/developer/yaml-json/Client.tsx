'use client';

import { useState } from 'react';
import yaml from 'js-yaml';
import { ArrowLeftRight, Clipboard, Eraser } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

export default function YamlJsonConverter() {
    const [yamlInput, setYamlInput] = useToolState('yaml-json', 'yamlInput', '');
    const [jsonInput, setJsonInput] = useToolState('yaml-json', 'jsonInput', '');
    const [error, setError] = useState<string | null>(null);

    const convertToJson = () => {
        try {
            setError(null);
            if (!yamlInput.trim()) {
                setJsonInput('');
                return;
            }
            setJsonInput(JSON.stringify(yaml.load(yamlInput), null, 2));
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const convertToYaml = () => {
        try {
            setError(null);
            if (!jsonInput.trim()) {
                setYamlInput('');
                return;
            }
            setYamlInput(yaml.dump(JSON.parse(jsonInput)));
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <ToolLayout title="YAML to JSON Converter" description="Convert between YAML and JSON formats instantly" category="developer">
            <div className="mx-auto max-w-6xl space-y-6">
                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                <div className="grid gap-4 md:grid-cols-2">
                    <ToolPanel
                        title="YAML"
                        actions={
                            <ToolActionBar>
                                <button onClick={() => navigator.clipboard.writeText(yamlInput)} className="btn btn-secondary h-8 gap-2 px-3"><Clipboard className="h-4 w-4" />Copy</button>
                                <button onClick={() => setYamlInput('')} className="btn btn-secondary h-8 gap-2 px-3"><Eraser className="h-4 w-4" />Clear</button>
                            </ToolActionBar>
                        }
                    >
                        <ToolTextarea
                            value={yamlInput}
                            onChange={(event) => setYamlInput(event.target.value)}
                            className="min-h-[420px]"
                            placeholder="Paste YAML here"
                        />
                    </ToolPanel>

                    <ToolPanel
                        title="JSON"
                        actions={
                            <ToolActionBar>
                                <button onClick={() => navigator.clipboard.writeText(jsonInput)} className="btn btn-secondary h-8 gap-2 px-3"><Clipboard className="h-4 w-4" />Copy</button>
                                <button onClick={() => setJsonInput('')} className="btn btn-secondary h-8 gap-2 px-3"><Eraser className="h-4 w-4" />Clear</button>
                            </ToolActionBar>
                        }
                    >
                        <ToolTextarea
                            value={jsonInput}
                            onChange={(event) => setJsonInput(event.target.value)}
                            className="min-h-[420px]"
                            placeholder="Paste JSON here"
                        />
                    </ToolPanel>
                </div>

                <ToolActionBar className="justify-center">
                    <button onClick={convertToJson} className="btn btn-primary gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        YAML to JSON
                    </button>
                    <button onClick={convertToYaml} className="btn btn-secondary gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        JSON to YAML
                    </button>
                </ToolActionBar>
            </div>
        </ToolLayout>
    );
}
