'use client';

import { useState } from 'react';
import * as Diff from 'diff';
import ToolLayout from '@/components/ToolLayout';

export default function PDFCompare() {
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [diffResult, setDiffResult] = useState<Diff.Change[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const extractText = async (file: File): Promise<string> => {
        try {
            // Dynamic import to avoid SSR issues with canvas/DOMMatrix
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += `[Page ${i}]\n${pageText}\n\n`;
            }

            return fullText;
        } catch (err) {
            console.error('Error extracting text from PDF:', err);
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
                extractText(file2)
            ]);

            const diff = Diff.diffLines(text1, text2);
            setDiffResult(diff);
        } catch (err: any) {
            setError(err.message || 'An error occurred while processing the PDFs.');
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
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* File 1 Input */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-foreground">
                            First PDF (Original)
                        </label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card hover:border-primary transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile1(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-2 pointer-events-none">
                                <span className="text-4xl">📄</span>
                                <p className="text-foreground font-medium">
                                    {file1 ? file1.name : 'Click or drop PDF here'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* File 2 Input */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-foreground">
                            Second PDF (Changed)
                        </label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card hover:border-primary transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile2(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-2 pointer-events-none">
                                <span className="text-4xl">📄</span>
                                <p className="text-foreground font-medium">
                                    {file2 ? file2.name : 'Click or drop PDF here'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center flex-col items-center gap-4">
                    <button
                        onClick={handleCompare}
                        disabled={!file1 || !file2 || isProcessing}
                        className={`bg-primary hover:bg-primary-dark text-white font-bold py-3 px-10 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg ${(!file1 || !file2 || isProcessing) ? 'opacity-50 cursor-not-allowed hover:transform-none' : ''
                            }`}
                    >
                        {isProcessing ? 'Processing...' : 'Compare PDFs'}
                    </button>
                    {error && <p className="text-red-500 font-medium">{error}</p>}
                </div>

                {/* Diff Result */}
                {diffResult && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-foreground">Comparison Result</h2>
                        <div className="bg-muted/30 border-2 border-border rounded-lg p-6 font-mono text-base overflow-x-auto whitespace-pre-wrap">
                            {diffResult.map((part, index) => {
                                let className = 'text-foreground';
                                if (part.added) {
                                    className = 'bg-green-500/20 text-green-700 dark:text-green-400 block';
                                } else if (part.removed) {
                                    className = 'bg-red-500/20 text-red-700 dark:text-red-400 block decoration-wavy line-through decoration-red-500/50';
                                }

                                return (
                                    <span key={index} className={className}>
                                        {part.value}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
