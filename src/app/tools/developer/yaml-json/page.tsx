'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import yaml from 'js-yaml';

export default function YamlJsonConverter() {
    const [yamlInput, setYamlInput] = useState('');
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const convertToJson = () => {
        try {
            setError(null);
            if (!yamlInput.trim()) {
                setJsonInput('');
                return;
            }
            const obj = yaml.load(yamlInput);
            setJsonInput(JSON.stringify(obj, null, 2));
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
            const obj = JSON.parse(jsonInput);
            setYamlInput(yaml.dump(obj));
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <ToolLayout title="YAML ↔ JSON Converter" description="Convert between YAML and JSON formats instantly" category="developer">
            <div className="max-w-6xl mx-auto space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* YAML Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-muted-foreground font-medium">YAML</label>
                            <div className="space-x-2">
                                <button 
                                    onClick={() => copyToClipboard(yamlInput)}
                                    className="text-xs px-2 py-1 bg-muted/30 rounded hover:bg-background transition-colors text-muted-foreground"
                                >
                                    Copy
                                </button>
                                <button 
                                    onClick={() => setYamlInput('')}
                                    className="text-xs px-2 py-1 bg-muted/30 rounded hover:bg-background transition-colors text-muted-foreground"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={yamlInput}
                            onChange={(e) => setYamlInput(e.target.value)}
                            className="w-full h-[500px] p-4 bg-card border-2 border-border rounded-lg font-mono text-sm resize-none focus:border-primary focus:outline-none transition-colors"
                            placeholder="Paste your YAML here..."
                        />
                    </div>

                    {/* JSON Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-muted-foreground font-medium">JSON</label>
                            <div className="space-x-2">
                                <button 
                                    onClick={() => copyToClipboard(jsonInput)}
                                    className="text-xs px-2 py-1 bg-muted/30 rounded hover:bg-background transition-colors text-muted-foreground"
                                >
                                    Copy
                                </button>
                                <button 
                                    onClick={() => setJsonInput('')}
                                    className="text-xs px-2 py-1 bg-muted/30 rounded hover:bg-background transition-colors text-muted-foreground"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full h-[500px] p-4 bg-card border-2 border-border rounded-lg font-mono text-sm resize-none focus:border-primary focus:outline-none transition-colors"
                            placeholder="Paste your JSON here..."
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button 
                        onClick={convertToJson}
                        className="btn btn-primary px-8"
                    >
                        Convert to JSON →
                    </button>
                    <button 
                        onClick={convertToYaml}
                        className="btn btn-secondary px-8"
                    >
                        ← Convert to YAML
                    </button>
                </div>
            </div>
        </ToolLayout>
    );
}
