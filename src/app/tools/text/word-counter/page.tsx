'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function WordCounter() {
    const [text, setText] = useState('');

    const stats = {
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        sentences: text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0,
        paragraphs: text.trim() ? text.split(/\n\n+/).filter(p => p.trim()).length : 0,
        lines: text.split('\n').length,
        readingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 200),
    };

    const clearText = () => setText('');

    return (
        <ToolLayout
            title="Word & Character Counter"
            description="Count words, characters, sentences, paragraphs, and estimate reading time"
            category="text"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Input Section */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <label htmlFor="input" className="block text-lg font-semibold text-text-primary mb-3">
                        Enter Your Text
                    </label>
                    <textarea
                        id="input"
                        className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-base font-mono resize-none transition-all duration-150 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing or paste your text here..."
                        rows={12}
                    />
                    <button onClick={clearText} className="btn btn-secondary mt-4">
                        Clear Text
                    </button>
                </div>

                {/* Statistics */}
                <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {[
                            { label: 'Words', value: stats.words },
                            { label: 'Characters', value: stats.characters },
                            { label: 'Characters (no spaces)', value: stats.charactersNoSpaces },
                            { label: 'Sentences', value: stats.sentences },
                            { label: 'Paragraphs', value: stats.paragraphs },
                            { label: 'Lines', value: stats.lines },
                            { label: 'Reading Time', value: `${stats.readingTime} min` },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="bg-bg-secondary border-2 border-border rounded-lg p-6 text-center transition-all duration-250 hover:border-primary hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className="text-4xl font-extrabold text-gradient mb-2">{stat.value}</div>
                                <div className="text-sm text-text-secondary uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
