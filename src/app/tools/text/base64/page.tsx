'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../case-converter/case-converter.module.css';

export default function Base64Encoder() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [error, setError] = useState('');

    const handleEncode = () => {
        try {
            setError('');
            const encoded = btoa(inputText);
            setOutputText(encoded);
        } catch (err) {
            setError('Failed to encode. Please check your input.');
        }
    };

    const handleDecode = () => {
        try {
            setError('');
            const decoded = atob(inputText);
            setOutputText(decoded);
        } catch (err) {
            setError('Failed to decode. Invalid Base64 string.');
        }
    };

    const handleProcess = () => {
        if (mode === 'encode') {
            handleEncode();
        } else {
            handleDecode();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputText);
    };

    const clearAll = () => {
        setInputText('');
        setOutputText('');
        setError('');
    };

    return (
        <ToolLayout
            title="Base64 Encoder/Decoder"
            description="Encode text to Base64 or decode Base64 strings back to text"
            category="text"
        >
            <div className={styles.tool}>
                <div className={styles.controls}>
                    <div className={styles.modeSelector}>
                        <button
                            className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setMode('encode')}
                        >
                            Encode
                        </button>
                        <button
                            className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setMode('decode')}
                        >
                            Decode
                        </button>
                    </div>
                </div>

                <div className={styles.inputSection}>
                    <label htmlFor="input" className={styles.label}>
                        {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                    </label>
                    <textarea
                        id="input"
                        className={styles.textarea}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                        rows={8}
                    />
                </div>

                <div className={styles.controls}>
                    <div className={styles.buttonGrid}>
                        <button onClick={handleProcess} className="btn btn-primary">
                            {mode === 'encode' ? '🔒 Encode to Base64' : '🔓 Decode from Base64'}
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
                            {mode === 'encode' ? 'Encoded Base64' : 'Decoded Text'}
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
                        placeholder="Result will appear here..."
                        rows={8}
                    />
                </div>
            </div>

            <style jsx>{`
        .modeSelector {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .error {
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: var(--color-error);
          margin-bottom: 1rem;
        }
      `}</style>
        </ToolLayout>
    );
}
