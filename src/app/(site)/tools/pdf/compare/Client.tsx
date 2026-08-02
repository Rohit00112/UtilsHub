'use client';

import { useState } from 'react';
import * as Diff from 'diff';
import { FileText, GitCompareArrows } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolEmptyState,
    ToolPanel,
    ToolStatus,
    ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type TextItem = { str?: string };

export default function PDFCompare() {
    const [file1, setFile1] = useToolState<File | null>('pdf-compare', 'file1', null);
    const [file2, setFile2] = useToolState<File | null>('pdf-compare', 'file2', null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [diffResult, setDiffResult] = useToolState<Diff.Change[] | null>('pdf-compare', 'diffResult', null);
    const [error, setError] = useState<string | null>(null);

    const extractText = async (file: File): Promise<string> => {
        try {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item) => (item as TextItem).str || '').join(' ');
                fullText += `[Page ${i}]\n${pageText}\n\n`;
            }

            return fullText;
        } catch {
            throw new Error(`Failed to extract text from ${file.name}`);
        }
    };

    const handleCompare = async () => {
        if (!file1 || !file2) return;

        setIsProcessing(true);
        setError(null);
        setDiffResult(null);

        try {
            const [text1, text2] = await Promise.all([
                extractText(file1),
                extractText(file2),
            ]);

            setDiffResult(Diff.diffLines(text1, text2));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while processing the PDFs.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="PDF Compare"
            description="Compare the text content of two PDF files"
            category="pdf"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <ToolPanel title="Original PDF">
                        <ToolUploadZone
                            title={file1 ? file1.name : 'Choose original PDF'}
                            description="Text will be extracted locally for comparison."
                            icon={<FileText className="h-8 w-8" />}
                            inputProps={{ type: 'file', accept: '.pdf,application/pdf', onChange: (event) => setFile1(event.target.files?.[0] || null) }}
                        />
                    </ToolPanel>

                    <ToolPanel title="Changed PDF">
                        <ToolUploadZone
                            title={file2 ? file2.name : 'Choose changed PDF'}
                            description="Use a second PDF with comparable text content."
                            icon={<FileText className="h-8 w-8" />}
                            inputProps={{ type: 'file', accept: '.pdf,application/pdf', onChange: (event) => setFile2(event.target.files?.[0] || null) }}
                        />
                    </ToolPanel>
                </div>

                <ToolActionBar className="justify-center">
                    <button
                        onClick={handleCompare}
                        disabled={!file1 || !file2 || isProcessing}
                        className="btn btn-primary gap-2"
                    >
                        <GitCompareArrows className="h-4 w-4" />
                        {isProcessing ? 'Comparing' : 'Compare PDFs'}
                    </button>
                </ToolActionBar>

                {error && <ToolStatus tone="error">{error}</ToolStatus>}

                <ToolPanel title="Comparison result">
                    {diffResult ? (
                        <div className="max-h-[560px] overflow-auto rounded-md border bg-background p-4 font-mono text-sm leading-6 whitespace-pre-wrap">
                            {diffResult.map((part, index) => {
                                let className = 'text-foreground';
                                if (part.added) className = 'block bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
                                if (part.removed) className = 'block bg-destructive/10 text-destructive line-through decoration-destructive/60';

                                return (
                                    <span key={index} className={className}>
                                        {part.value}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <ToolEmptyState
                            icon={<GitCompareArrows className="h-8 w-8" />}
                            title="No comparison yet"
                            description="Choose two PDFs and run a comparison to see text-level differences."
                        />
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
