'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';

export default function LoremIpsumGenerator() {
    const [mode, setMode] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [count, setCount] = useState(3);
    const [startWithLorem, setStartWithLorem] = useState(true);
    const [generatedText, setGeneratedText] = useState('');

    const generateWord = () => {
        return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
    };

    const generateSentence = (minWords = 5, maxWords = 15) => {
        const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
        const words = [];
        for (let i = 0; i < wordCount; i++) {
            words.push(generateWord());
        }
        const sentence = words.join(' ');
        return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    };

    const generateParagraph = (minSentences = 4, maxSentences = 8) => {
        const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
        const sentences = [];
        for (let i = 0; i < sentenceCount; i++) {
            sentences.push(generateSentence());
        }
        return sentences.join(' ');
    };

    const generate = () => {
        let result = '';

        if (mode === 'words') {
            const words = [];
            if (startWithLorem) {
                words.push(...LOREM_START.split(' ').slice(0, Math.min(count, 5)));
                for (let i = words.length; i < count; i++) {
                    words.push(generateWord());
                }
            } else {
                for (let i = 0; i < count; i++) {
                    words.push(generateWord());
                }
            }
            result = words.join(' ');
        } else if (mode === 'sentences') {
            const sentences = [];
            if (startWithLorem) {
                sentences.push(LOREM_START + '.');
                for (let i = 1; i < count; i++) {
                    sentences.push(generateSentence());
                }
            } else {
                for (let i = 0; i < count; i++) {
                    sentences.push(generateSentence());
                }
            }
            result = sentences.join(' ');
        } else {
            const paragraphs = [];
            if (startWithLorem) {
                paragraphs.push(LOREM_START + '. ' + generateParagraph(3, 6));
                for (let i = 1; i < count; i++) {
                    paragraphs.push(generateParagraph());
                }
            } else {
                for (let i = 0; i < count; i++) {
                    paragraphs.push(generateParagraph());
                }
            }
            result = paragraphs.join('\n\n');
        }

        setGeneratedText(result);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedText);
    };

    return (
        <ToolLayout
            title="Lorem Ipsum Generator"
            description="Generate placeholder text for your designs and mockups"
            category="developer"
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Controls */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value as any)}
                                className="input w-full"
                            >
                                <option value="paragraphs">Paragraphs</option>
                                <option value="sentences">Sentences</option>
                                <option value="words">Words</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Count
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={mode === 'words' ? 1000 : mode === 'sentences' ? 100 : 20}
                                value={count}
                                onChange={(e) => setCount(Number(e.target.value))}
                                className="input w-full"
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={startWithLorem}
                                    onChange={(e) => setStartWithLorem(e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                />
                                <span className="text-text-primary text-sm">Start with &ldquo;Lorem ipsum&rdquo;</span>
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={generate}
                        className="btn btn-primary w-full"
                    >
                        Generate Lorem Ipsum
                    </button>
                </div>

                {/* Output */}
                {generatedText && (
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-text-primary">Generated Text</h3>
                            <button
                                onClick={copyToClipboard}
                                className="btn btn-secondary py-2 px-4"
                            >
                                📋 Copy
                            </button>
                        </div>
                        <div className="p-4 bg-bg-tertiary rounded-lg border border-border">
                            <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                                {generatedText}
                            </p>
                        </div>
                        <div className="mt-3 text-sm text-text-secondary">
                            {mode === 'words' && `${generatedText.split(' ').length} words`}
                            {mode === 'sentences' && `${generatedText.split('. ').length} sentences`}
                            {mode === 'paragraphs' && `${generatedText.split('\n\n').length} paragraphs`}
                            {' • '}
                            {generatedText.length} characters
                        </div>
                    </div>
                )}

                {!generatedText && (
                    <div className="bg-bg-secondary border-2 border-dashed border-border rounded-lg p-16 text-center">
                        <div className="text-8xl mb-6 opacity-20">📝</div>
                        <h3 className="text-2xl font-bold text-text-primary mb-2">No Text Generated</h3>
                        <p className="text-text-secondary">Click &ldquo;Generate Lorem Ipsum&rdquo; to create placeholder text</p>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
