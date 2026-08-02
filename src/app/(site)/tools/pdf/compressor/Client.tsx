'use client';

import { useState } from 'react';
import { Download, Gauge, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolEmptyState, ToolMetric, ToolPanel, ToolResultCard, ToolStatus, ToolUploadZone } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

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
    const [file, setFile] = useToolState<File | null>('pdf-compressor', 'file', null);
    const [pageCount, setPageCount] = useToolState('pdf-compressor', 'pageCount', 0);
    const [result, setResult] = useToolState<CompressionResult | null>('pdf-compressor', 'result', null);
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
            pdfDoc.setProducer('FreeWebTools PDF Compressor');
            pdfDoc.setCreator('FreeWebTools');

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
                <ToolPanel title="PDF file">
                    <ToolUploadZone
                        title={file ? file.name : 'Choose a PDF file'}
                        description={file ? `${pageCount} pages, ${formatBytes(file.size)}` : 'Best for PDFs with reusable objects and unoptimized structure'}
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'application/pdf,.pdf', onChange: handleFileChange }}
                    />

                    {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                </ToolPanel>

                <ToolPanel title="Optimization pass" description="Rewrites the PDF with object streams. Image-heavy PDFs may show limited reduction.">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <button onClick={compressPdf} disabled={!file || isProcessing} className="btn btn-primary gap-2">
                            <Gauge className="h-4 w-4" />
                            {isProcessing ? 'Compressing' : 'Compress PDF'}
                        </button>
                    </div>
                </ToolPanel>

                <ToolPanel title="Result" description={result ? 'Your optimized PDF is ready.' : 'Compression details will appear here.'}>
                    {!result ? (
                        <ToolEmptyState title="No compression result" description="Upload a PDF and run the optimization pass." />
                    ) : (
                        <div className="space-y-5 p-5">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <ToolMetric label="Original" value={formatBytes(result.originalSize)} />
                                <ToolMetric label="Optimized" value={formatBytes(result.compressedSize)} />
                                <ToolMetric label="Change" value={`${wasReduced ? '-' : '+'}${Math.abs(reduction).toFixed(1)}%`} />
                            </div>

                            <ToolStatus tone={wasReduced ? 'success' : 'warning'}>
                                {wasReduced
                                    ? `Reduced by ${formatBytes(result.originalSize - result.compressedSize)} across ${result.pageCount} pages.`
                                    : 'This PDF did not shrink. It may already be optimized or mostly image data.'}
                            </ToolStatus>

                            <ToolResultCard
                                title={result.name}
                                meta={`${result.pageCount} pages`}
                                actions={
                                <button onClick={() => downloadBlob(result.url, result.name)} className="btn btn-secondary gap-2 self-start sm:self-auto">
                                    <Download className="h-4 w-4" />
                                    Download
                                </button>
                                }
                            />
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
