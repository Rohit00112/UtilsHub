'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../../text/case-converter/case-converter.module.css';

export default function QRCodeGenerator() {
    const [text, setText] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [size, setSize] = useState(256);

    const generateQRCode = () => {
        if (!text.trim()) {
            alert('Please enter some text or URL');
            return;
        }

        // Using a free QR code API
        const encodedText = encodeURIComponent(text);
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
        setQrCodeUrl(url);
    };

    const downloadQRCode = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = 'qrcode.png';
        link.click();
    };

    return (
        <ToolLayout
            title="QR Code Generator"
            description="Generate QR codes from text, URLs, or any data"
            category="security"
        >
            <div className={styles.tool}>
                <div className={styles.inputSection}>
                    <label htmlFor="input" className={styles.label}>
                        Enter Text or URL
                    </label>
                    <textarea
                        id="input"
                        className={styles.textarea}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text, URL, phone number, or any data..."
                        rows={6}
                    />

                    <label className={styles.label} style={{ marginTop: '1.5rem' }}>
                        QR Code Size: {size}x{size}px
                    </label>
                    <input
                        type="range"
                        min="128"
                        max="512"
                        step="64"
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className={styles.slider}
                    />

                    <button
                        onClick={generateQRCode}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem' }}
                    >
                        🔲 Generate QR Code
                    </button>
                </div>

                {qrCodeUrl && (
                    <div className={styles.outputSection}>
                        <label className={styles.label}>Generated QR Code</label>
                        <div className={styles.qrDisplay}>
                            <img src={qrCodeUrl} alt="QR Code" />
                        </div>
                        <button
                            onClick={downloadQRCode}
                            className="btn btn-secondary"
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            💾 Download QR Code
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
        .slider {
          width: 100%;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--bg-tertiary);
          outline: none;
          margin: 1rem 0;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
        }

        .qrDisplay {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          background: white;
          border-radius: var(--radius-lg);
          margin-top: 1rem;
        }

        .qrDisplay img {
          max-width: 100%;
          height: auto;
          display: block;
        }
      `}</style>
        </ToolLayout>
    );
}
