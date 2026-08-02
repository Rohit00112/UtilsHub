'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Download, FileText, Upload, XCircle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolEmptyState,
    ToolMetric,
    ToolPanel,
    ToolResultCard,
    ToolStatus,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

interface PdfItem {
    id: string;
    file: File;
    pageCount: number;
}

interface MergeResult {
    name: string;
    url: string;
    size: number;
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

export default function PDFMerger() {
    const [items, setItems] = useToolState<PdfItem[]>('pdf-merger', 'items', []);
    const [result, setResult] = useToolState<MergeResult | null>('pdf-merger', 'result', null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const totalInputSize = useMemo(() => items.reduce((sum, item) => sum + item.file.size, 0), [items]);
    const totalPages = useMemo(() => items.reduce((sum, item) => sum + item.pageCount, 0), [items]);

    const clearResult = () => {
        if (result) URL.revokeObjectURL(result.url);
        setResult(null);
    };

    const handleFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        event.target.value = '';
        clearResult();
        setError('');

        if (selectedFiles.length === 0) return;

        try {
            const { PDFDocument } = await import('pdf-lib');
            const nextItems = await Promise.all(selectedFiles.map(async (file, index) => {
                const pdfDoc = await PDFDocument.load(await file.arrayBuffer());

                return {
                    id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
                    file,
                    pageCount: pdfDoc.getPageCount(),
                };
            }));

            setItems((current) => [...current, ...nextItems]);
        } catch {
            setError('One or more files could not be read as PDFs. Password-protected PDFs may not be supported.');
        }
    };

    const removeItem = (id: string) => {
        clearResult();
        setItems((current) => current.filter((item) => item.id !== id));
    };

    const moveItem = (index: number, direction: -1 | 1) => {
        clearResult();
        setItems((current) => {
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= current.length) return current;

            const next = [...current];
            const [item] = next.splice(index, 1);
            next.splice(targetIndex, 0, item);
            return next;
        });
    };

    const clearAll = () => {
        clearResult();
        setItems([]);
        setError('');
    };

    const mergePdfs = async () => {
        if (items.length < 2) {
            setError('Choose at least two PDFs to merge.');
            return;
        }

        clearResult();
        setError('');
        setIsProcessing(true);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const mergedPdf = await PDFDocument.create();

            for (const item of items) {
                const sourcePdf = await PDFDocument.load(await item.file.arrayBuffer());
                const pageIndexes = Array.from({ length: sourcePdf.getPageCount() }, (_, index) => index);
                const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndexes);
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            mergedPdf.setCreator('FreeWebTools');
            mergedPdf.setProducer('FreeWebTools PDF Merger');

            const bytes = bytesToArrayBuffer(await mergedPdf.save({ useObjectStreams: true }));
            const baseName = items[0]?.file.name.replace(/\.pdf$/i, '') || 'merged';
            const name = `${baseName}-merged.pdf`;
            const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));

            setResult({
                name,
                url,
                size: bytes.byteLength,
                pageCount: mergedPdf.getPageCount(),
            });
        } catch {
            setError('Unable to merge these PDFs. Try removing malformed or password-protected files.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout title="PDF Merger" description="Combine multiple PDF files into one ordered document" category="pdf">
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel title="PDF files">
                    <ToolUploadZone
                        title="Choose PDF files"
                        description="Select two or more files. They stay in your browser."
                        icon={<Upload className="h-8 w-8" />}
                        inputProps={{ type: 'file', accept: 'application/pdf,.pdf', multiple: true, onChange: handleFilesChange }}
                    />
                    {error && <ToolStatus tone="error" className="mt-4">{error}</ToolStatus>}
                </ToolPanel>

                <div className="grid gap-3 sm:grid-cols-3">
                    <ToolMetric label="Files" value={items.length} />
                    <ToolMetric label="Pages" value={totalPages} />
                    <ToolMetric label="Input size" value={formatBytes(totalInputSize)} />
                </div>

                <ToolPanel
                    title="Merge order"
                    description={items.length > 0 ? 'Files are merged from top to bottom.' : 'Uploaded PDFs will appear here.'}
                    actions={(
                        <ToolActionBar>
                            <button type="button" onClick={clearAll} disabled={items.length === 0} className="btn btn-secondary h-8 px-3">
                                Clear
                            </button>
                            <button type="button" onClick={mergePdfs} disabled={items.length < 2 || isProcessing} className="btn btn-primary h-8 gap-2 px-3">
                                <FileText className="h-4 w-4" />
                                {isProcessing ? 'Merging' : 'Merge PDFs'}
                            </button>
                        </ToolActionBar>
                    )}
                >
                    {items.length === 0 ? (
                        <ToolEmptyState title="No PDFs selected" description="Upload two or more PDFs to build a merge queue." />
                    ) : (
                        <div className="divide-y rounded-md border">
                            {items.map((item, index) => (
                                <div key={item.id} className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/20 font-mono text-sm text-muted-foreground">
                                        {index + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <FileText className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{item.file.name}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {item.pageCount} pages - {formatBytes(item.file.size)}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} className="btn btn-secondary h-8 w-8 p-0" title="Move up">
                                            <ChevronUp className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} className="btn btn-secondary h-8 w-8 p-0" title="Move down">
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => removeItem(item.id)} className="btn btn-secondary h-8 w-8 p-0" title="Remove">
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>

                <ToolPanel title="Merged PDF" description={result ? 'Your combined PDF is ready.' : 'Merge output will appear here.'}>
                    {!result ? (
                        <ToolEmptyState title="No merged file yet" description="Add PDFs, arrange them, and run the merge." />
                    ) : (
                        <ToolResultCard
                            title={result.name}
                            meta={`${result.pageCount} pages - ${formatBytes(result.size)}`}
                            actions={
                                <button type="button" onClick={() => downloadBlob(result.url, result.name)} className="btn btn-secondary gap-2">
                                    <Download className="h-4 w-4" />
                                    Download
                                </button>
                            }
                        />
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
