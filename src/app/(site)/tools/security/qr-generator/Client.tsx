'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, QrCode } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolPanel, ToolStatus } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

export default function QRCodeGenerator() {
    const [text, setText] = useToolState('qr-generator', 'text', '');
    const [qrCodeUrl, setQrCodeUrl] = useToolState('qr-generator', 'qrCodeUrl', '');
    const [size, setSize] = useToolState('qr-generator', 'size', 256);
    const [error, setError] = useState('');

    const generateQRCode = () => {
        if (!text.trim()) {
            setError('Enter text, a URL, or other data before generating a QR code.');
            return;
        }
        setError('');
        const encodedText = encodeURIComponent(text);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`);
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
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <ToolPanel title="QR content" description="Enter the data you want encoded.">
                        <textarea
                            id="input"
                            className="min-h-40 w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="Enter text, URL, phone number, or any data..."
                        />

                        <div className="mt-5">
                            <div className="mb-2 flex justify-between">
                                <label htmlFor="size" className="text-sm font-medium text-muted-foreground">Size</label>
                                <span className="text-sm font-semibold text-foreground">{size}x{size}px</span>
                            </div>
                            <input
                                id="size"
                                type="range"
                                min="128"
                                max="512"
                                step="64"
                                value={size}
                                onChange={(event) => setSize(Number(event.target.value))}
                                className="w-full accent-current"
                            />
                        </div>

                        <button onClick={generateQRCode} className="btn btn-primary mt-5 w-full gap-2">
                            <QrCode className="h-4 w-4" />
                            Generate QR code
                        </button>
                        {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                    </ToolPanel>

                    <ToolPanel title="Preview">
                        <div className="flex min-h-80 flex-col items-center justify-center rounded-md border bg-muted/30 p-6 text-center">
                            {qrCodeUrl ? (
                                <>
                                    <div className="mb-5 rounded-md bg-white p-4 shadow-sm">
                                        <Image
                                            src={qrCodeUrl}
                                            alt="QR Code"
                                            width={size}
                                            height={size}
                                            className="block h-auto max-w-full"
                                            unoptimized
                                        />
                                    </div>
                                    <button onClick={downloadQRCode} className="btn btn-secondary w-full gap-2">
                                        <Download className="h-4 w-4" />
                                        Download PNG
                                    </button>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    <QrCode className="mx-auto mb-3 h-10 w-10" />
                                    Generated QR code will appear here.
                                </div>
                            )}
                        </div>
                    </ToolPanel>
                </div>
            </div>
        </ToolLayout>
    );
}
