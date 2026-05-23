'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileText } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolEmptyState, ToolPanel, ToolStatus, ToolUploadZone } from '@/components/tools/ToolPrimitives';
import * as Diff from 'diff';

type TextItem = { str?: string };

export default function PdfCompare() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [modifiedFile, setModifiedFile] = useState<File | null>(null);
    const [_originalText, setOriginalText] = useState('');
    const [_modifiedText, setModifiedText] = useState('');
    const [diffResult, setDiffResult] = useState<Diff.Change[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pdfjsLib, setPdfjsLib] = useState<typeof import('pdfjs-dist') | null>(null);

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

    const extractText = useCallback(async (file: File): Promise<string> => {
        if (!pdfjsLib) throw new Error('PDF library not loaded');

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => (item as TextItem).str || '').join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText;
    }, [pdfjsLib]);

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
    }, [extractText, originalFile, modifiedFile]);

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
            <div className="mx-auto max-w-6xl space-y-6">
                {/* File Upload Section */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ToolPanel title="Original PDF">
                        <ToolUploadZone
                            title={originalFile ? originalFile.name : 'Choose original PDF'}
                            description="The original document to compare from."
                            icon={<FileText className="h-8 w-8" />}
                            inputProps={{ type: 'file', accept: '.pdf,application/pdf', onChange: (event) => handleFileChange(event, 'original') }}
                        />
                    </ToolPanel>

                    <ToolPanel title="Modified PDF">
                        <ToolUploadZone
                            title={modifiedFile ? modifiedFile.name : 'Choose modified PDF'}
                            description="The changed document to compare against."
                            icon={<FileText className="h-8 w-8" />}
                            inputProps={{ type: 'file', accept: '.pdf,application/pdf', onChange: (event) => handleFileChange(event, 'modified') }}
                        />
                    </ToolPanel>
                </div>

                {/* Loading & Error */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                        <p className="mt-2 text-muted-foreground">Extracting text and comparing...</p>
                    </div>
                )}

                {error && (
                    <ToolStatus tone="error">{error}</ToolStatus>
                )}

                {/* Results Section */}
                <ToolPanel title="Comparison result">
                    {diffResult.length > 0 && !loading ? (
                        <div className="max-h-[600px] overflow-y-auto rounded-md border bg-muted/20 p-4 font-mono text-sm leading-6 whitespace-pre-wrap break-words">
                            {diffResult.map((part, index) => {
                                const color = part.added ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                                    part.removed ? 'bg-destructive/10 text-destructive line-through decoration-destructive/60' :
                                        'text-foreground';
                                return (
                                    <span key={index} className={`${color} px-0.5 rounded`}>
                                        {part.value}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <ToolEmptyState title="No comparison yet" description="Choose two PDFs to compare their extracted text." />
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
