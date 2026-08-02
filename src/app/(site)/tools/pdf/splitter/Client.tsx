'use client';

import { useState } from 'react';
import { Download, FileArchive, FileText, Scissors, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolEmptyState, ToolField, ToolPanel, ToolStatus, ToolUploadZone } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type SplitMode = 'ranges' | 'pages';

interface SplitResult {
    name: string;
    pages: string;
    bytes: ArrayBuffer;
    url: string;
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** sizeIndex).toFixed(sizeIndex === 0 ? 0 : 1)} ${units[sizeIndex]}`;
}

function parsePageRanges(input: string, pageCount: number) {
    const groups = input
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
            if (!match) {
                throw new Error(`Invalid page range: ${part}`);
            }

            const start = Number(match[1]);
            const end = Number(match[2] || match[1]);

            if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
                throw new Error(`Page range ${part} is outside the 1-${pageCount} page limit.`);
            }

            if (start > end) {
                throw new Error(`Page range ${part} starts after it ends.`);
            }

            return Array.from({ length: end - start + 1 }, (_, index) => start + index);
        });

    if (groups.length === 0) {
        throw new Error('Enter at least one page range.');
    }

    return groups;
}

function downloadBlob(url: string, name: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return buffer;
}

export default function PDFSplitter() {
    const [file, setFile] = useToolState<File | null>('pdf-splitter', 'file', null);
    const [pageCount, setPageCount] = useToolState('pdf-splitter', 'pageCount', 0);
    const [ranges, setRanges] = useToolState('pdf-splitter', 'ranges', '1');
    const [mode, setMode] = useToolState<SplitMode>('pdf-splitter', 'mode', 'ranges');
    const [results, setResults] = useToolState<SplitResult[]>('pdf-splitter', 'results', []);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const clearResults = () => {
        results.forEach((result) => URL.revokeObjectURL(result.url));
        setResults([]);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        clearResults();
        setError('');
        setFile(null);
        setPageCount(0);

        if (!selected) return;

        try {
            const { PDFDocument } = await import('pdf-lib');
            const sourcePdf = await PDFDocument.load(await selected.arrayBuffer());
            setFile(selected);
            setPageCount(sourcePdf.getPageCount());
            setRanges(sourcePdf.getPageCount() > 1 ? `1-${sourcePdf.getPageCount()}` : '1');
        } catch {
            setError('Unable to read that PDF. Try another file.');
        }
    };

    const splitPdf = async () => {
        if (!file) {
            setError('Choose a PDF before splitting.');
            return;
        }

        clearResults();
        setError('');
        setIsProcessing(true);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const sourcePdf = await PDFDocument.load(await file.arrayBuffer());
            const groups = mode === 'pages'
                ? Array.from({ length: sourcePdf.getPageCount() }, (_, index) => [index + 1])
                : parsePageRanges(ranges, sourcePdf.getPageCount());

            const baseName = file.name.replace(/\.pdf$/i, '') || 'split-pdf';
            const output = await Promise.all(groups.map(async (pages, index) => {
                const targetPdf = await PDFDocument.create();
                const copiedPages = await targetPdf.copyPages(sourcePdf, pages.map((page) => page - 1));
                copiedPages.forEach((page) => targetPdf.addPage(page));

                const bytes = bytesToArrayBuffer(await targetPdf.save({ useObjectStreams: true }));
                const pageLabel = pages.length === 1 ? `page-${pages[0]}` : `pages-${pages[0]}-${pages[pages.length - 1]}`;
                const name = `${baseName}-${pageLabel}-${index + 1}.pdf`;
                const blob = new Blob([bytes], { type: 'application/pdf' });

                return {
                    name,
                    pages: pages.join(', '),
                    bytes,
                    url: URL.createObjectURL(blob),
                };
            }));

            setResults(output);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to split this PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadZip = async () => {
        if (results.length === 0) return;

        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        results.forEach((result) => {
            zip.file(result.name, result.bytes);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        downloadBlob(url, 'split-pdfs.zip');
        URL.revokeObjectURL(url);
    };

    return (
        <ToolLayout title="PDF Splitter" description="Split a PDF into page ranges or individual files" category="pdf">
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel title="PDF file">
                    <ToolUploadZone
                        title={file ? file.name : 'Choose a PDF file'}
                        description={file ? `${pageCount} pages, ${formatBytes(file.size)}` : 'Files stay in your browser'}
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'application/pdf,.pdf', onChange: handleFileChange }}
                    />
                </ToolPanel>

                <ToolPanel title="Split settings">
                    <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto]">
                        <ToolField label="Split mode" htmlFor="mode">
                            <select
                                id="mode"
                                value={mode}
                                onChange={(event) => setMode(event.target.value as SplitMode)}
                                className="input h-10"
                            >
                                <option value="ranges">Custom ranges</option>
                                <option value="pages">Every page</option>
                            </select>
                        </ToolField>

                        <ToolField label="Page ranges" htmlFor="ranges">
                            <input
                                id="ranges"
                                value={ranges}
                                onChange={(event) => setRanges(event.target.value)}
                                disabled={mode === 'pages'}
                                className="input h-10"
                                placeholder="1-3, 5, 8-10"
                            />
                        </ToolField>

                        <div className="flex items-end">
                            <button onClick={splitPdf} disabled={!file || isProcessing} className="btn btn-primary h-10 gap-2">
                                <Scissors className="h-4 w-4" />
                                {isProcessing ? 'Splitting' : 'Split PDF'}
                            </button>
                        </div>
                    </div>

                    {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                </ToolPanel>

                <ToolPanel
                    title="Split files"
                    description={results.length > 0 ? `${results.length} PDFs ready to download.` : 'Split results will appear here.'}
                    actions={<button onClick={downloadZip} disabled={results.length === 0} className="btn btn-secondary gap-2"><FileArchive className="h-4 w-4" />Download ZIP</button>}
                >
                    {results.length === 0 ? (
                        <ToolEmptyState title="No split files" description="Upload a PDF and choose how to split it." />
                    ) : (
                        <div className="divide-y rounded-md border">
                            {results.map((result) => (
                                <div key={result.url} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <FileText className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{result.name}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            Pages {result.pages} - {formatBytes(result.bytes.byteLength)}
                                        </div>
                                    </div>
                                    <button onClick={() => downloadBlob(result.url, result.name)} className="btn btn-secondary gap-2 justify-self-start md:justify-self-end">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
