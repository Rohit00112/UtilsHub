'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../../text/case-converter/case-converter.module.css';

export default function JSONFormatter() {
    const [inputJSON, setInputJSON] = useState('');
    const [outputJSON, setOutputJSON] = useState('');
    const [error, setError] = useState('');
    const [indentSize, setIndentSize] = useState(2);

    const formatJSON = () => {
        try {
            setError('');
            const parsed = JSON.parse(inputJSON);
            const formatted = JSON.stringify(parsed, null, indentSize);
            setOutputJSON(formatted);
        } catch (err: any) {
            setError(`Invalid JSON: ${err.message}`);
            setOutputJSON('');
        }
    };

    const minifyJSON = () => {
        try {
            setError('');
            const parsed = JSON.parse(inputJSON);
            const minified = JSON.stringify(parsed);
            setOutputJSON(minified);
        } catch (err: any) {
            setError(`Invalid JSON: ${err.message}`);
            setOutputJSON('');
        }
    };

    const validateJSON = () => {
        try {
            JSON.parse(inputJSON);
            setError('');
            alert('✅ Valid JSON!');
        } catch (err: any) {
            setError(`Invalid JSON: ${err.message}`);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputJSON);
    };

    const clearAll = () => {
        setInputJSON('');
        setOutputJSON('');
        setError('');
    };

    return (
        <ToolLayout
            title="JSON Formatter & Validator"
            description="Format, minify, and validate JSON data"
            category="developer"
        >
            <div className={styles.tool}>
                <div className={styles.inputSection}>
                    <label htmlFor="input" className={styles.label}>
                        Input JSON
                    </label>
                    <textarea
                        id="input"
                        className={styles.textarea}
                        value={inputJSON}
                        onChange={(e) => setInputJSON(e.target.value)}
                        placeholder='{"name": "John", "age": 30}'
                        rows={12}
                        style={{ fontFamily: 'var(--font-mono)' }}
                    />
                </div>

                <div className={styles.controls}>
                    <label className={styles.label}>Indent Size: {indentSize} spaces</label>
                    <input
                        type="range"
                        min="2"
                        max="8"
                        step="2"
                        value={indentSize}
                        onChange={(e) => setIndentSize(Number(e.target.value))}
                        className={styles.slider}
                        style={{ marginBottom: '1rem' }}
                    />

                    <div className={styles.buttonGrid}>
                        <button onClick={formatJSON} className="btn btn-primary">
                            ✨ Format JSON
                        </button>
                        <button onClick={minifyJSON} className="btn btn-primary">
                            🗜️ Minify JSON
                        </button>
                        <button onClick={validateJSON} className="btn btn-secondary">
                            ✅ Validate
                        </button>
                        <button onClick={clearAll} className="btn btn-secondary">
                            Clear All
                        </button>
                    </div>
                </div>

                {error && (
                    <div className={styles.error}>
                        ⚠️ {error}
                    </div>
                )}

                <div className={styles.outputSection}>
                    <div className={styles.labelRow}>
                        <label htmlFor="output" className={styles.label}>
                            Output JSON
                        </label>
                        {outputJSON && (
                            <button onClick={copyToClipboard} className={styles.copyBtn}>
                                📋 Copy
                            </button>
                        )}
                    </div>
                    <textarea
                        id="output"
                        className={styles.textarea}
                        value={outputJSON}
                        readOnly
                        placeholder="Formatted JSON will appear here..."
                        rows={12}
                        style={{ fontFamily: 'var(--font-mono)' }}
                    />
                </div>
            </div>

            <style jsx>{`
        .slider {
          width: 100%;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--bg-tertiary);
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
        }

        .error {
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: var(--color-error);
          margin-bottom: 1rem;
          font-family: var(--font-mono);
        }
      `}</style>
        </ToolLayout>
    );
}
