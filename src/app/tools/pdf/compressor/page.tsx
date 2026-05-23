'use client';

import { useState } from 'react';
import { Download, FileText, Gauge, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';

interface CompressionResult {
    url: string;
    name: string;
    bytes: ArrayBuffer;
    originalSize: number;
    compressedSize: number;
    pageCount: number;
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** sizeIndex).toFixed(sizeIndex === 0 ? 0 : 1)} ${units[sizeIndex]}`;
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return buffer;
}

function downloadBlob(url: string, name: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
}

export default function PDFCompressor() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [result, setResult] = useState<CompressionResult | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const clearResult = () => {
        if (result) URL.revokeObjectURL(result.url);
        setResult(null);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        clearResult();
        setError('');
        setFile(null);
        setPageCount(0);

        if (!selected) return;

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await selected.arrayBuffer());
            setFile(selected);
            setPageCount(pdfDoc.getPageCount());
        } catch {
            setError('Unable to read that PDF. Try a different file.');
        }
    };

    const compressPdf = async () => {
        if (!file) {
            setError('Choose a PDF before compressing.');
            return;
        }

        clearResult();
        setError('');
        setIsProcessing(true);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const sourceBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(sourceBytes);
            pdfDoc.setProducer('UtilsHub PDF Compressor');
            pdfDoc.setCreator('UtilsHub');

            const optimizedBytes = bytesToArrayBuffer(await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: 50,
            }));

            const baseName = file.name.replace(/\.pdf$/i, '') || 'compressed';
            const name = `${baseName}-compressed.pdf`;
            const url = URL.createObjectURL(new Blob([optimizedBytes], { type: 'application/pdf' }));

            setResult({
                url,
                name,
                bytes: optimizedBytes,
                originalSize: file.size,
                compressedSize: optimizedBytes.byteLength,
                pageCount: pdfDoc.getPageCount(),
            });
        } catch {
            setError('Unable to optimize this PDF. Password-protected or malformed PDFs may not be supported.');
        } finally {
            setIsProcessing(false);
        }
    };

    const reduction = result
        ? ((result.originalSize - result.compressedSize) / result.originalSize) * 100
        : 0;
    const wasReduced = reduction > 0;

    return (
        <ToolLayout title="PDF Compressor" description="Optimize PDF structure and reduce size in your browser" category="pdf">
            <div className="mx-auto max-w-5xl space-y-6">
                <section className="rounded-lg border bg-card p-5 sm:p-6">
                    <label className="block text-sm font-medium text-muted-foreground">PDF file</label>
                    <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/40">
                        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                        <span className="font-medium text-foreground">{file ? file.name : 'Choose a PDF file'}</span>
                        <span className="mt-1 text-sm text-muted-foreground">
                            {file ? `${pageCount} pages, ${formatBytes(file.size)}` : 'Best for PDFs with reusable objects and unoptimized structure'}
                        </span>
                        <input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} className="hidden" />
                    </label>

                    {error && (
                        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </section>

                <section className="rounded-lg border bg-card p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Optimization pass</h3>
                            <p className="text-sm text-muted-foreground">
                                Rewrites the PDF with object streams. Image-heavy PDFs may show limited reduction.
                            </p>
                        </div>
                        <button onClick={compressPdf} disabled={!file || isProcessing} className="btn btn-primary gap-2">
                            <Gauge className="h-4 w-4" />
                            {isProcessing ? 'Compressing' : 'Compress PDF'}
                        </button>
                    </div>
                </section>

                <section className="rounded-lg border bg-card">
                    <div className="border-b p-5">
                        <h3 className="text-lg font-semibold text-foreground">Result</h3>
                        <p className="text-sm text-muted-foreground">
                            {result ? 'Your optimized PDF is ready.' : 'Compression details will appear here.'}
                        </p>
                    </div>

                    {!result ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Upload a PDF and run the optimization pass.
                        </div>
                    ) : (
                        <div className="space-y-5 p-5">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Metric label="Original" value={formatBytes(result.originalSize)} />
                                <Metric label="Optimized" value={formatBytes(result.compressedSize)} />
                                <Metric label="Change" value={`${wasReduced ? '-' : '+'}${Math.abs(reduction).toFixed(1)}%`} />
                            </div>

                            <div className={`rounded-md border px-3 py-2 text-sm ${wasReduced ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                                {wasReduced
                                    ? `Reduced by ${formatBytes(result.originalSize - result.compressedSize)} across ${result.pageCount} pages.`
                                    : 'This PDF did not shrink. It may already be optimized or mostly image data.'}
                            </div>

                            <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-2">
                                    <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <span className="truncate font-medium text-foreground">{result.name}</span>
                                </div>
                                <button onClick={() => downloadBlob(result.url, result.name)} className="btn btn-secondary gap-2 self-start sm:self-auto">
                                    <Download className="h-4 w-4" />
                                    Download
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </ToolLayout>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border bg-muted/30 p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 text-xl font-semibold text-foreground">{value}</div>
        </div>
    );
}
