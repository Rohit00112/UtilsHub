'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { v4 as uuidv4, v1 as uuidv1 } from 'uuid';

export default function UuidGenerator() {
    const [uuids, setUuids] = useState<string[]>([]);
    const [count, setCount] = useState(1);
    const [version, setVersion] = useState<'v4' | 'v1'>('v4');

    const generate = () => {
        const newUuids = [];
        for (let i = 0; i < count; i++) {
            newUuids.push(version === 'v4' ? uuidv4() : uuidv1());
        }
        setUuids(newUuids);
    };

    const copyAll = () => navigator.clipboard.writeText(uuids.join('\n'));

    return (
        <ToolLayout title="UUID Generator" description="Generate unique identifiers (UUIDs) for your applications" category="developer">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className="block text-text-secondary font-medium mb-2">Version</label>
                            <select
                                value={version}
                                onChange={(e) => setVersion(e.target.value as 'v4' | 'v1')}
                                className="input"
                            >
                                <option value="v4">UUID v4 (Random)</option>
                                <option value="v1">UUID v1 (Timestamp)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-text-secondary font-medium mb-2">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={count}
                                onChange={(e) => setCount(Number(e.target.value))}
                                className="input"
                            />
                        </div>
                        <div className="flex items-end">
                            <button onClick={generate} className="btn btn-primary w-full">Generate UUIDs</button>
                        </div>
                    </div>

                    {uuids.length > 0 && (
                        <div className="relative">
                            <div className="absolute top-4 right-4">
                                <button onClick={copyAll} className="px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors text-sm font-semibold">
                                    Copy All
                                </button>
                            </div>
                            <textarea
                                value={uuids.join('\n')}
                                readOnly
                                rows={Math.min(uuids.length + 1, 15)}
                                className="w-full p-6 bg-bg-tertiary border-2 border-border rounded-lg font-mono text-text-primary resize-none focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}
