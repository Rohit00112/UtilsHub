'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from './case-converter.module.css';

export default function CaseConverter() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');

    const convertToUpperCase = () => {
        setOutputText(inputText.toUpperCase());
    };

    const convertToLowerCase = () => {
        setOutputText(inputText.toLowerCase());
    };

    const convertToTitleCase = () => {
        const titleCase = inputText
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        setOutputText(titleCase);
    };

    const convertToSentenceCase = () => {
        const sentenceCase = inputText
            .toLowerCase()
            .replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
        setOutputText(sentenceCase);
    };

    const convertToCamelCase = () => {
        const camelCase = inputText
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
        setOutputText(camelCase);
    };

    const convertToSnakeCase = () => {
        const snakeCase = inputText
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
            .replace(/^_/, '');
        setOutputText(snakeCase);
    };

    const convertToKebabCase = () => {
        const kebabCase = inputText
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
            .replace(/^-/, '')
            .toLowerCase();
        setOutputText(kebabCase);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputText);
    };

    const clearAll = () => {
        setInputText('');
        setOutputText('');
    };

    return (
        <ToolLayout
            title="Text Case Converter"
            description="Convert text between different cases: UPPER, lower, Title, Sentence, camelCase, snake_case, kebab-case"
            category="text"
        >
            <div className={styles.tool}>
                <div className={styles.inputSection}>
                    <label htmlFor="input" className={styles.label}>
                        Input Text
                    </label>
                    <textarea
                        id="input"
                        className={styles.textarea}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter your text here..."
                        rows={8}
                    />
                    <div className={styles.stats}>
                        <span>Characters: {inputText.length}</span>
                        <span>Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</span>
                    </div>
                </div>

                <div className={styles.controls}>
                    <div className={styles.buttonGrid}>
                        <button onClick={convertToUpperCase} className="btn btn-primary">
                            UPPER CASE
                        </button>
                        <button onClick={convertToLowerCase} className="btn btn-primary">
                            lower case
                        </button>
                        <button onClick={convertToTitleCase} className="btn btn-primary">
                            Title Case
                        </button>
                        <button onClick={convertToSentenceCase} className="btn btn-primary">
                            Sentence case
                        </button>
                        <button onClick={convertToCamelCase} className="btn btn-primary">
                            camelCase
                        </button>
                        <button onClick={convertToSnakeCase} className="btn btn-primary">
                            snake_case
                        </button>
                        <button onClick={convertToKebabCase} className="btn btn-primary">
                            kebab-case
                        </button>
                        <button onClick={clearAll} className="btn btn-secondary">
                            Clear All
                        </button>
                    </div>
                </div>

                <div className={styles.outputSection}>
                    <div className={styles.labelRow}>
                        <label htmlFor="output" className={styles.label}>
                            Output Text
                        </label>
                        {outputText && (
                            <button onClick={copyToClipboard} className={styles.copyBtn}>
                                📋 Copy
                            </button>
                        )}
                    </div>
                    <textarea
                        id="output"
                        className={styles.textarea}
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
