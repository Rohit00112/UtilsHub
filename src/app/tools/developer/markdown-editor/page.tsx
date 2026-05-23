'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { marked } from 'marked';

export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useState('# Hello World\n\nStart typing markdown here...');
    const [html, setHtml] = useState('');
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

    useEffect(() => {
        const parseMarkdown = async () => {
            const parsed = await marked.parse(markdown);
            setHtml(parsed);
        };
        parseMarkdown();
    }, [markdown]);

    const copyHtml = () => {
        navigator.clipboard.writeText(html);
    };

    const copyMarkdown = () => {
        navigator.clipboard.writeText(markdown);
    };

    const downloadHtml = () => {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <ToolLayout title="Markdown Editor" description="Write and preview Markdown in real-time" category="developer">
            <div className="max-w-6xl mx-auto h-[calc(100vh-300px)] min-h-[600px] flex flex-col">
                {/* Toolbar */}
                <div className="bg-card border border-border rounded-t-lg p-4 flex justify-between items-center">
                    <div className="flex gap-2 md:hidden">
                        <button
                            onClick={() => setActiveTab('write')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'write' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/30'
                                }`}
                        >
                            Write
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/30'
                                }`}
                        >
                            Preview
                        </button>
                    </div>
                    <div className="hidden md:block text-muted-foreground font-medium">
                        Split View
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={copyMarkdown}
                            className="btn btn-secondary text-sm py-1 px-3"
                        >
                            Copy MD
                        </button>
                        <button
                            onClick={copyHtml}
                            className="btn btn-secondary text-sm py-1 px-3"
                        >
                            Copy HTML
                        </button>
                        <button
                            onClick={downloadHtml}
                            className="btn btn-primary text-sm py-1 px-3"
                        >
                            Export HTML
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex border-x border-b border-border rounded-b-lg overflow-hidden bg-card">
                    {/* Input */}
                    <div className={`flex-1 flex flex-col ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
                        <textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            className="flex-1 p-6 bg-card text-foreground font-mono resize-none focus:outline-none border-r border-border"
                            placeholder="Type your markdown here..."
                        />
                    </div>

                    {/* Preview */}
                    <div className={`flex-1 flex flex-col bg-white overflow-auto ${activeTab === 'write' ? 'hidden md:flex' : 'flex'}`}>
                        <div
                            className="prose max-w-none p-6 text-gray-900"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
