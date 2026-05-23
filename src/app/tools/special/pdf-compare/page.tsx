'use client';

import { useState, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import * as Diff from 'diff';

export default function PdfCompare() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [modifiedFile, setModifiedFile] = useState<File | null>(null);
    const [_originalText, setOriginalText] = useState('');
    const [_modifiedText, setModifiedText] = useState('');
    const [diffResult, setDiffResult] = useState<Diff.Change[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pdfjsLib, setPdfjsLib] = useState<any>(null);

    // Load pdfjs-dist dynamically only on client side
    useEffect(() => {
        const loadPdfJs = async () => {
            const pdfjs = await import('pdfjs-dist');
            // Set worker source
            pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
            setPdfjsLib(pdfjs);
        };
        loadPdfJs();
    }, []);

    const extractText = async (file: File): Promise<string> => {
        if (!pdfjsLib) throw new Error('PDF library not loaded');

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText;
    };

    const handleCompare = useCallback(async () => {
        if (!originalFile || !modifiedFile) return;

        setLoading(true);
        setError('');
        setDiffResult([]);

        try {
            const [text1, text2] = await Promise.all([
                extractText(originalFile),
                extractText(modifiedFile)
            ]);

            setOriginalText(text1);
            setModifiedText(text2);

            const diff = Diff.diffWords(text1, text2);
            setDiffResult(diff);
        } catch (err) {
            console.error(err);
            setError('Failed to process PDFs. Please ensure they are valid PDF files.');
        } finally {
            setLoading(false);
        }
    }, [originalFile, modifiedFile]);

    useEffect(() => {
        if (originalFile && modifiedFile) {
            handleCompare();
        }
    }, [originalFile, modifiedFile, handleCompare]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'original' | 'modified') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'original') setOriginalFile(file);
            else setModifiedFile(file);
        }
    };

    return (
        <ToolLayout
            title="PDF Compare"
            description="Upload two PDF files to compare their text content and highlight differences"
            category="special"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* File Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card border-2 border-border rounded-lg p-6">
                        <label className="block text-lg font-semibold text-foreground mb-4">Original PDF</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileChange(e, 'original')}
                            className="block w-full text-sm text-muted-foreground
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary/10 file:text-primary
                                hover:file:bg-primary/20
                                cursor-pointer"
                        />
                        {originalFile && (
                            <p className="mt-2 text-sm text-muted-foreground">Selected: {originalFile.name}</p>
                        )}
                    </div>

                    <div className="bg-card border-2 border-border rounded-lg p-6">
                        <label className="block text-lg font-semibold text-foreground mb-4">Modified PDF</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileChange(e, 'modified')}
                            className="block w-full text-sm text-muted-foreground
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary/10 file:text-primary
                                hover:file:bg-primary/20
                                cursor-pointer"
                        />
                        {modifiedFile && (
                            <p className="mt-2 text-sm text-muted-foreground">Selected: {modifiedFile.name}</p>
                        )}
                    </div>
                </div>

                {/* Loading & Error */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                        <p className="mt-2 text-muted-foreground">Extracting text and comparing...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {diffResult.length > 0 && !loading && (
                    <div className="bg-card border-2 border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Comparison Result</h3>
                        <div className="bg-muted/30 p-6 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap break-words border border-border max-h-[600px] overflow-y-auto">
                            {diffResult.map((part, index) => {
                                const color = part.added ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                                    part.removed ? 'bg-red-500/20 text-red-700 dark:text-red-400 decoration-wavy line-through decoration-red-400/50' :
                                        'text-foreground';
                                return (
                                    <span key={index} className={`${color} px-0.5 rounded`}>
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
