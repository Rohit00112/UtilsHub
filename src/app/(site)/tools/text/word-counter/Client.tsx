'use client';

import { Eraser } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolPanel } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const textareaClass = 'min-h-80 w-full rounded-md border border-input bg-background px-4 py-3 font-mono text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring';

export default function WordCounter() {
    const [text, setText] = useToolState('word-counter', 'text', '');

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const stats = [
        { label: 'Words', value: words },
        { label: 'Characters', value: text.length },
        { label: 'No spaces', value: text.replace(/\s/g, '').length },
        { label: 'Sentences', value: text.trim() ? text.split(/[.!?]+/).filter((sentence) => sentence.trim()).length : 0 },
        { label: 'Paragraphs', value: text.trim() ? text.split(/\n\n+/).filter((paragraph) => paragraph.trim()).length : 0 },
        { label: 'Lines', value: text.split('\n').length },
        { label: 'Reading time', value: `${Math.ceil(words / 200)} min` },
    ];

    return (
        <ToolLayout
            title="Word & Character Counter"
            description="Count words, characters, sentences, paragraphs, and estimate reading time"
            category="text"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel
                    title="Text"
                    description="Type or paste content to calculate live writing statistics."
                    actions={(
                        <button onClick={() => setText('')} className="btn btn-secondary gap-2">
                            <Eraser className="h-4 w-4" />
                            Clear
                        </button>
                    )}
                >
                    <textarea
                        id="input"
                        className={textareaClass}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Start typing or paste your text here..."
                    />
                </ToolPanel>

                <ToolPanel title="Statistics">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                        {stats.map((stat) => (
                            <div key={stat.label} className="rounded-md border bg-muted/30 p-4 text-center">
                                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                                <div className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
