'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { Download, FileArchive, FileText, Scissors, Upload } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import ToolLayout from '@/components/ToolLayout';

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
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [ranges, setRanges] = useState('1');
    const [mode, setMode] = useState<SplitMode>('ranges');
    const [results, setResults] = useState<SplitResult[]>([]);
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
                <section className="rounded-lg border bg-card p-5 sm:p-6">
                    <label className="block text-sm font-medium text-muted-foreground">PDF file</label>
                    <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/40">
                        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                        <span className="font-medium text-foreground">{file ? file.name : 'Choose a PDF file'}</span>
                        <span className="mt-1 text-sm text-muted-foreground">
                            {file ? `${pageCount} pages, ${formatBytes(file.size)}` : 'Files stay in your browser'}
                        </span>
                        <input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} className="hidden" />
                    </label>
                </section>

                <section className="rounded-lg border bg-card p-5 sm:p-6">
                    <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto]">
                        <div>
                            <label htmlFor="mode" className="mb-2 block text-sm font-medium text-muted-foreground">
                                Split mode
                            </label>
                            <select
                                id="mode"
                                value={mode}
                                onChange={(event) => setMode(event.target.value as SplitMode)}
                                className="input h-10"
                            >
                                <option value="ranges">Custom ranges</option>
                                <option value="pages">Every page</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="ranges" className="mb-2 block text-sm font-medium text-muted-foreground">
                                Page ranges
                            </label>
                            <input
                                id="ranges"
                                value={ranges}
                                onChange={(event) => setRanges(event.target.value)}
                                disabled={mode === 'pages'}
                                className="input h-10"
                                placeholder="1-3, 5, 8-10"
                            />
                        </div>

                        <div className="flex items-end">
                            <button onClick={splitPdf} disabled={!file || isProcessing} className="btn btn-primary h-10 gap-2">
                                <Scissors className="h-4 w-4" />
                                {isProcessing ? 'Splitting' : 'Split PDF'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </section>

                <section className="rounded-lg border bg-card">
                    <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Split files</h3>
                            <p className="text-sm text-muted-foreground">
                                {results.length > 0 ? `${results.length} PDFs ready to download.` : 'Split results will appear here.'}
                            </p>
                        </div>
                        <button onClick={downloadZip} disabled={results.length === 0} className="btn btn-secondary gap-2">
                            <FileArchive className="h-4 w-4" />
                            Download ZIP
                        </button>
                    </div>

                    {results.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Upload a PDF and choose how to split it.
                        </div>
                    ) : (
                        <div className="divide-y">
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
                </section>
            </div>
        </ToolLayout>
    );
}
