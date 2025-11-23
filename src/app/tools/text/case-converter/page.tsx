'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function CaseConverter() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');

    const convertToUpperCase = () => setOutputText(inputText.toUpperCase());
    const convertToLowerCase = () => setOutputText(inputText.toLowerCase());
    const convertToTitleCase = () => {
        const titleCase = inputText.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        setOutputText(titleCase);
    };
    const convertToSentenceCase = () => {
        const sentenceCase = inputText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
        setOutputText(sentenceCase);
    };
    const convertToCamelCase = () => {
        const camelCase = inputText.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
        setOutputText(camelCase);
    };
    const convertToSnakeCase = () => {
        const snakeCase = inputText.trim().replace(/\s+/g, '_').replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
        setOutputText(snakeCase);
    };
    const convertToKebabCase = () => {
        const kebabCase = inputText.trim().replace(/\s+/g, '-').replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/^-/, '').toLowerCase();
        setOutputText(kebabCase);
    };
    const copyToClipboard = () => navigator.clipboard.writeText(outputText);
    const clearAll = () => { setInputText(''); setOutputText(''); };

    return (
        <ToolLayout
            title="Text Case Converter"
            description="Convert text between different cases: UPPER, lower, Title, Sentence, camelCase, snake_case, kebab-case"
            category="text"
        >
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Input Section */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6 transition-all duration-250 hover:border-primary/50">
                    <label htmlFor="input" className="block text-lg font-semibold text-text-primary mb-3">
                        Input Text
                    </label>
                    <textarea
                        id="input"
                        className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-base font-mono resize-none transition-all duration-150 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter your text here..."
                        rows={8}
                    />
                    <div className="flex gap-6 mt-3 text-sm text-text-tertiary">
                        <span className="font-medium">Characters: <span className="text-primary-light">{inputText.length}</span></span>
                        <span className="font-medium">Words: <span className="text-primary-light">{inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</span></span>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={convertToUpperCase} className="btn btn-primary">UPPER CASE</button>
                    <button onClick={convertToLowerCase} className="btn btn-primary">lower case</button>
                    <button onClick={convertToTitleCase} className="btn btn-primary">Title Case</button>
                    <button onClick={convertToSentenceCase} className="btn btn-primary">Sentence case</button>
                    <button onClick={convertToCamelCase} className="btn btn-primary">camelCase</button>
                    <button onClick={convertToSnakeCase} className="btn btn-primary">snake_case</button>
                    <button onClick={convertToKebabCase} className="btn btn-primary">kebab-case</button>
                    <button onClick={clearAll} className="btn btn-secondary">Clear All</button>
                </div>

                {/* Output Section */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6 transition-all duration-250 hover:border-primary/50">
                    <div className="flex items-center justify-between mb-3">
                        <label htmlFor="output" className="text-lg font-semibold text-text-primary">
                            Output Text
                        </label>
                        {outputText && (
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md text-primary-light font-semibold text-sm transition-all duration-150 hover:scale-105"
                            >
                                📋 Copy
                            </button>
                        )}
                    </div>
                    <textarea
                        id="output"
                        className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-base font-mono resize-none focus:outline-none placeholder:text-text-tertiary"
                        value={outputText}
                        readOnly
                        placeholder="Converted text will appear here..."
                        rows={8}
                    />
                </div>
            </div>
        </ToolLayout>
    );
}
