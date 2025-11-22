'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../case-converter/case-converter.module.css';

export default function URLEncoder() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');

    const handleEncode = () => {
        const encoded = encodeURIComponent(inputText);
        setOutputText(encoded);
    };

    const handleDecode = () => {
        try {
            const decoded = decodeURIComponent(inputText);
            setOutputText(decoded);
        } catch (err) {
            setOutputText('Error: Invalid URL-encoded string');
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
    };

    return (
        <ToolLayout
            title="URL Encoder/Decoder"
            description="Encode URLs for safe transmission or decode URL-encoded strings"
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
                        {mode === 'encode' ? 'Text/URL to Encode' : 'URL-encoded String to Decode'}
                    </label>
                    <textarea
                        id="input"
                        className={styles.textarea}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={mode === 'encode' ? 'Enter text or URL to encode...' : 'Enter URL-encoded string to decode...'}
                        rows={8}
                    />
                </div>

                <div className={styles.controls}>
                    <div className={styles.buttonGrid}>
                        <button onClick={handleProcess} className="btn btn-primary">
                            {mode === 'encode' ? '🔒 Encode URL' : '🔓 Decode URL'}
                        </button>
                        <button onClick={clearAll} className="btn btn-secondary">
                            Clear All
                        </button>
                    </div>
                </div>

                <div className={styles.outputSection}>
                    <div className={styles.labelRow}>
                        <label htmlFor="output" className={styles.label}>
                            {mode === 'encode' ? 'Encoded URL' : 'Decoded Text'}
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

                <div className={styles.infoBox}>
                    <h3>ℹ️ What is URL Encoding?</h3>
                    <p>
                        URL encoding converts special characters into a format that can be transmitted over the Internet.
                        For example, spaces become <code>%20</code> and special characters like <code>&</code> become <code>%26</code>.
                    </p>
                </div>
            </div>

            <style jsx>{`
        .modeSelector {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .infoBox {
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .infoBox h3 {
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .infoBox p {
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        .infoBox code {
          background: var(--bg-tertiary);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          color: var(--color-primary-light);
        }
      `}</style>
        </ToolLayout>
    );
}
