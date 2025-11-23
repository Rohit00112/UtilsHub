'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function QRCodeGenerator() {
    const [text, setText] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [size, setSize] = useState(256);

    const generateQRCode = () => {
        if (!text.trim()) {
            alert('Please enter some text or URL');
            return;
        }
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
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-6 h-fit">
                        <label htmlFor="input" className="block text-lg font-semibold text-text-primary mb-3">
                            Enter Text or URL
                        </label>
                        <textarea
                            id="input"
                            className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-base transition-all duration-150 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary mb-6"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text, URL, phone number, or any data..."
                            rows={6}
                        />

                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <label className="text-text-secondary font-medium">Size</label>
                                <span className="text-primary font-bold">{size}x{size}px</span>
                            </div>
                            <input
                                type="range"
                                min="128"
                                max="512"
                                step="64"
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                                className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <button
                            onClick={generateQRCode}
                            className="btn btn-primary w-full"
                        >
                            🔲 Generate QR Code
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="bg-bg-secondary border-2 border-border rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
                        {qrCodeUrl ? (
                            <>
                                <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
                                    <img src={qrCodeUrl} alt="QR Code" className="max-w-full h-auto block" />
                                </div>
                                <button
                                    onClick={downloadQRCode}
                                    className="btn btn-secondary w-full"
                                >
                                    💾 Download PNG
                                </button>
                            </>
                        ) : (
                            <div className="text-center text-text-tertiary">
                                <div className="text-6xl mb-4 opacity-20">🔲</div>
                                <p>Generated QR code will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
