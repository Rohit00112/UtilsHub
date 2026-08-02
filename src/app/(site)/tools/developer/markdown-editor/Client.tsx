'use client';

import { useEffect } from 'react';
import { Clipboard, Download, Eye, PenLine } from 'lucide-react';
import { marked } from 'marked';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel, ToolSegmentedControl, ToolTextarea } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useToolState('markdown-editor', 'markdown', '# Hello World\n\nStart typing markdown here...');
    const [html, setHtml] = useToolState('markdown-editor', 'html', '');
    const [activeTab, setActiveTab] = useToolState<'write' | 'preview'>('markdown-editor', 'activeTab', 'write');

    useEffect(() => {
        const parseMarkdown = async () => {
            setHtml(await marked.parse(markdown));
        };
        parseMarkdown();
    }, [markdown, setHtml]);

    const downloadHtml = () => {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.html';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <ToolLayout title="Markdown Editor" description="Write and preview Markdown in real time" category="developer">
            <div className="mx-auto max-w-6xl space-y-4">
                <ToolPanel>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="md:hidden">
                            <ToolSegmentedControl
                                value={activeTab}
                                onChange={setActiveTab}
                                options={[
                                    { label: 'Write', value: 'write' },
                                    { label: 'Preview', value: 'preview' },
                                ]}
                            />
                        </div>
                        <div className="hidden items-center gap-2 text-sm font-medium text-muted-foreground md:flex">
                            <PenLine className="h-4 w-4" />
                            Split view
                            <Eye className="ml-3 h-4 w-4" />
                            Live preview
                        </div>
                        <ToolActionBar>
                            <button onClick={() => navigator.clipboard.writeText(markdown)} className="btn btn-secondary h-8 gap-2 px-3">
                                <Clipboard className="h-4 w-4" />
                                Copy MD
                            </button>
                            <button onClick={() => navigator.clipboard.writeText(html)} className="btn btn-secondary h-8 gap-2 px-3">
                                <Clipboard className="h-4 w-4" />
                                Copy HTML
                            </button>
                            <button onClick={downloadHtml} className="btn btn-primary h-8 gap-2 px-3">
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </ToolActionBar>
                    </div>
                </ToolPanel>

                <div className="grid min-h-[600px] gap-4 md:grid-cols-2">
                    <ToolPanel title="Markdown" className={activeTab === 'preview' ? 'hidden md:block' : undefined}>
                        <ToolTextarea
                            value={markdown}
                            onChange={(event) => setMarkdown(event.target.value)}
                            className="min-h-[520px] resize-none"
                            placeholder="Type your markdown here..."
                        />
                    </ToolPanel>

                    <ToolPanel title="Preview" className={activeTab === 'write' ? 'hidden md:block' : undefined}>
                        <div
                            className="min-h-[520px] overflow-auto rounded-md border bg-background p-4 text-sm leading-7 text-foreground"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    </ToolPanel>
                </div>
            </div>
        </ToolLayout>
    );
}
