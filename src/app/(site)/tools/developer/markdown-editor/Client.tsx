'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Bold,
    Clipboard,
    Code,
    Download,
    Eye,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link2,
    List,
    ListOrdered,
    Maximize2,
    Minimize2,
    PenLine,
    Quote,
    Strikethrough,
    Table,
    Type,
    CheckSquare,
} from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/github-dark.min.css';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolPanel,
    ToolSegmentedControl,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

/* ── Register highlight.js languages ─────────────────────────── */
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('java', java);

/* ── Configure marked with highlight.js ─────────────────────── */
marked.setOptions({
    gfm: true,
    breaks: false,
});

const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
    let highlighted: string;
    try {
        highlighted = language === 'plaintext'
            ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            : hljs.highlight(text, { language }).value;
    } catch {
        highlighted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    return `<pre class="hljs-code-block"><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

marked.use({ renderer });

/* ── Text stats ─────────────────────────────────────────────── */
function getStats(text: string) {
    const trimmed = text.trim();
    const words = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    const readingMins = Math.max(1, Math.ceil(words / 200));
    return { words, chars, charsNoSpaces, lines, readingMins };
}

/* ── Toolbar actions ────────────────────────────────────────── */
interface ToolbarAction {
    icon: React.ReactNode;
    label: string;
    prefix: string;
    suffix: string;
    block?: boolean; // prepends to each line rather than wrapping
    placeholder?: string;
}

const toolbarActions: ToolbarAction[] = [
    { icon: <Bold className="h-4 w-4" />, label: 'Bold', prefix: '**', suffix: '**', placeholder: 'bold text' },
    { icon: <Italic className="h-4 w-4" />, label: 'Italic', prefix: '_', suffix: '_', placeholder: 'italic text' },
    { icon: <Strikethrough className="h-4 w-4" />, label: 'Strikethrough', prefix: '~~', suffix: '~~', placeholder: 'deleted text' },
    { icon: <Code className="h-4 w-4" />, label: 'Inline code', prefix: '`', suffix: '`', placeholder: 'code' },
    { icon: <Heading1 className="h-4 w-4" />, label: 'Heading 1', prefix: '# ', suffix: '', block: true, placeholder: 'Heading' },
    { icon: <Heading2 className="h-4 w-4" />, label: 'Heading 2', prefix: '## ', suffix: '', block: true, placeholder: 'Heading' },
    { icon: <Heading3 className="h-4 w-4" />, label: 'Heading 3', prefix: '### ', suffix: '', block: true, placeholder: 'Heading' },
    { icon: <Quote className="h-4 w-4" />, label: 'Blockquote', prefix: '> ', suffix: '', block: true, placeholder: 'quote' },
    { icon: <List className="h-4 w-4" />, label: 'Bullet list', prefix: '- ', suffix: '', block: true, placeholder: 'list item' },
    { icon: <ListOrdered className="h-4 w-4" />, label: 'Numbered list', prefix: '1. ', suffix: '', block: true, placeholder: 'list item' },
    { icon: <CheckSquare className="h-4 w-4" />, label: 'Task list', prefix: '- [ ] ', suffix: '', block: true, placeholder: 'task' },
    { icon: <Link2 className="h-4 w-4" />, label: 'Link', prefix: '[', suffix: '](https://)', placeholder: 'link text' },
    { icon: <ImageIcon className="h-4 w-4" aria-hidden="true" />, label: 'Image', prefix: '![', suffix: '](https://)', placeholder: 'alt text' },
    { icon: <Table className="h-4 w-4" />, label: 'Table', prefix: '\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |\n', suffix: '', placeholder: '' },
];

const SAMPLE_MARKDOWN = `# Welcome to the Markdown Editor

Write **Markdown** and see it rendered _in real time_. This editor supports **GitHub Flavored Markdown** with syntax highlighting.

## Features

- ✨ **Formatting toolbar** — click buttons to insert Markdown syntax
- 🎨 **Syntax highlighting** — code blocks rendered with highlight.js
- 📊 **Word count** — live stats in the status bar
- 📥 **Export** — download as \`.md\` or \`.html\`

## Code Example

\`\`\`typescript
interface User {
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

## Task List

- [x] Set up the editor
- [x] Add live preview
- [ ] Write your content
- [ ] Export and share

## Table

| Feature | Status | Notes |
| ------- | ------ | ----- |
| Bold    | ✅     | Works great |
| Tables  | ✅     | GFM tables |
| Code    | ✅     | Highlighted |

> **Tip:** Use the toolbar above to quickly insert formatting, or type Markdown directly.
`;

export default function MarkdownEditor() {
    const [markdownText, setMarkdownText] = useToolState('markdown-editor', 'markdown', SAMPLE_MARKDOWN);
    const [html, setHtml] = useToolState('markdown-editor', 'html', '');
    const [activeTab, setActiveTab] = useToolState<'write' | 'preview'>('markdown-editor', 'activeTab', 'write');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copiedType, setCopiedType] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const stats = useMemo(() => getStats(markdownText), [markdownText]);

    useEffect(() => {
        const parseMarkdown = async () => {
            setHtml(await marked.parse(markdownText));
        };
        parseMarkdown();
    }, [markdownText, setHtml]);

    // Handle fullscreen escape
    useEffect(() => {
        if (!isFullscreen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullscreen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isFullscreen]);

    const applyToolbarAction = useCallback((action: ToolbarAction) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = markdownText.slice(start, end);
        const text = selected || action.placeholder || '';

        let newText: string;
        let cursorStart: number;
        let cursorEnd: number;

        if (action.block && !selected) {
            const before = markdownText.slice(0, start);
            const after = markdownText.slice(end);
            const needsNewline = before.length > 0 && !before.endsWith('\n');
            const insertion = `${needsNewline ? '\n' : ''}${action.prefix}${text}${action.suffix}`;
            newText = before + insertion + after;
            cursorStart = before.length + (needsNewline ? 1 : 0) + action.prefix.length;
            cursorEnd = cursorStart + text.length;
        } else {
            const before = markdownText.slice(0, start);
            const after = markdownText.slice(end);
            const insertion = `${action.prefix}${text}${action.suffix}`;
            newText = before + insertion + after;
            cursorStart = start + action.prefix.length;
            cursorEnd = cursorStart + text.length;
        }

        setMarkdownText(newText);
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(cursorStart, cursorEnd);
        });
    }, [markdownText, setMarkdownText]);

    const copy = (type: 'md' | 'html') => {
        navigator.clipboard.writeText(type === 'md' ? markdownText : html);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 1500);
    };

    const download = (type: 'md' | 'html') => {
        const content = type === 'md' ? markdownText : `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Markdown Export</title>\n<style>\nbody { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.7; color: #1a1a2e; }\npre { background: #0d1117; color: #c9d1d9; padding: 1rem; border-radius: 8px; overflow-x: auto; }\ncode { font-family: 'SF Mono', Consolas, monospace; font-size: 0.9em; }\ntable { border-collapse: collapse; width: 100%; }\nth, td { border: 1px solid #d0d7de; padding: 0.5rem 1rem; text-align: left; }\nth { background: #f6f8fa; }\nblockquote { border-left: 4px solid #d0d7de; margin: 1rem 0; padding: 0.5rem 1rem; color: #57606a; }\n</style>\n</head>\n<body>\n${html}\n</body>\n</html>`;
        const blob = new Blob([content], { type: type === 'md' ? 'text/markdown' : 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = type === 'md' ? 'document.md' : 'document.html';
        link.click();
        URL.revokeObjectURL(url);
    };

    const editorContent = (
        <div className={`mx-auto space-y-4 ${isFullscreen ? 'max-w-full h-full flex flex-col' : 'max-w-6xl'}`}>
            {/* Toolbar */}
            <ToolPanel>
                <div className="flex flex-col gap-3">
                    {/* Formatting toolbar */}
                    <div className="flex flex-wrap items-center gap-1 border-b border-border/50 pb-3">
                        {toolbarActions.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                title={action.label}
                                onClick={() => applyToolbarAction(action)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                            >
                                {action.icon}
                            </button>
                        ))}
                        <div className="mx-2 h-6 w-px bg-border" />
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
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="hidden items-center gap-2 text-sm font-medium text-muted-foreground md:flex">
                            <PenLine className="h-4 w-4" />
                            Editor
                            <Eye className="ml-3 h-4 w-4" />
                            Live preview
                        </div>
                        <ToolActionBar>
                            <button onClick={() => copy('md')} className="btn btn-secondary h-8 gap-2 px-3">
                                <Clipboard className="h-4 w-4" />
                                {copiedType === 'md' ? 'Copied!' : 'Copy MD'}
                            </button>
                            <button onClick={() => copy('html')} className="btn btn-secondary h-8 gap-2 px-3">
                                <Clipboard className="h-4 w-4" />
                                {copiedType === 'html' ? 'Copied!' : 'Copy HTML'}
                            </button>
                            <button onClick={() => download('md')} className="btn btn-secondary h-8 gap-2 px-3">
                                <Download className="h-4 w-4" />
                                .md
                            </button>
                            <button onClick={() => download('html')} className="btn btn-primary h-8 gap-2 px-3">
                                <Download className="h-4 w-4" />
                                .html
                            </button>
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="btn btn-secondary h-8 w-8 p-0"
                                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                            >
                                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </button>
                        </ToolActionBar>
                    </div>
                </div>
            </ToolPanel>

            {/* Editor + Preview */}
            <div className={`grid gap-4 md:grid-cols-2 ${isFullscreen ? 'flex-1 min-h-0' : 'min-h-[600px]'}`}>
                <ToolPanel title="Markdown" className={`${activeTab === 'preview' ? 'hidden md:block' : ''} ${isFullscreen ? 'h-full' : ''}`}>
                    <textarea
                        ref={textareaRef}
                        value={markdownText}
                        onChange={(e) => setMarkdownText(e.target.value)}
                        className={`textarea font-mono leading-relaxed resize-none ${isFullscreen ? 'h-full min-h-0' : 'min-h-[520px]'}`}
                        placeholder="Type your markdown here..."
                        spellCheck={false}
                    />
                </ToolPanel>

                <ToolPanel title="Preview" className={`${activeTab === 'write' ? 'hidden md:block' : ''} ${isFullscreen ? 'h-full overflow-auto' : ''}`}>
                    <div
                        className={`overflow-auto rounded-md border bg-background p-6 prose-preview ${isFullscreen ? 'h-full min-h-0' : 'min-h-[520px]'}`}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </ToolPanel>
            </div>

            {/* Status bar */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card/50 px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" />
                    {stats.words} words
                </span>
                <span>{stats.chars} characters</span>
                <span>{stats.charsNoSpaces} chars (no spaces)</span>
                <span>{stats.lines} lines</span>
                <span className="ml-auto">~{stats.readingMins} min read</span>
            </div>
        </div>
    );

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-background p-4 overflow-hidden">
                {editorContent}
            </div>
        );
    }

    return (
        <ToolLayout title="Markdown Editor" description="Write and preview Markdown with a formatting toolbar, syntax highlighting, and live HTML export" category="developer">
            {editorContent}

            {/* Prose preview styles */}
            <style jsx global>{`
                .prose-preview {
                    font-size: 0.9375rem;
                    line-height: 1.8;
                    color: var(--color-foreground, #1a1a2e);
                }
                .prose-preview h1 { font-size: 2em; font-weight: 800; margin: 1.5em 0 0.5em; line-height: 1.2; letter-spacing: -0.03em; border-bottom: 1px solid var(--color-border, #e5e7eb); padding-bottom: 0.3em; }
                .prose-preview h2 { font-size: 1.5em; font-weight: 700; margin: 1.25em 0 0.5em; line-height: 1.3; letter-spacing: -0.02em; border-bottom: 1px solid var(--color-border, #e5e7eb); padding-bottom: 0.25em; }
                .prose-preview h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.4em; line-height: 1.4; }
                .prose-preview h4 { font-size: 1.1em; font-weight: 600; margin: 1em 0 0.4em; }
                .prose-preview p { margin: 0.75em 0; }
                .prose-preview a { color: #6366f1; text-decoration: underline; text-underline-offset: 2px; }
                .prose-preview a:hover { color: #4f46e5; }
                .prose-preview strong { font-weight: 700; }
                .prose-preview em { font-style: italic; }
                .prose-preview del { text-decoration: line-through; opacity: 0.7; }
                .prose-preview code:not(.hljs) { background: var(--color-muted, #f3f4f6); padding: 0.15em 0.4em; border-radius: 6px; font-size: 0.875em; font-family: 'SF Mono', Consolas, 'Liberation Mono', monospace; }
                .prose-preview .hljs-code-block { background: #0d1117; border-radius: 12px; padding: 1rem 1.25rem; margin: 1em 0; overflow-x: auto; font-size: 0.875em; line-height: 1.6; }
                .prose-preview .hljs-code-block code { background: none; padding: 0; font-size: inherit; color: #c9d1d9; }
                .prose-preview blockquote { border-left: 4px solid #6366f1; margin: 1em 0; padding: 0.5em 1em; background: var(--color-muted, #f8f9fa); border-radius: 0 8px 8px 0; color: var(--color-muted-foreground, #6b7280); }
                .prose-preview ul, .prose-preview ol { margin: 0.75em 0; padding-left: 1.5em; }
                .prose-preview li { margin: 0.25em 0; }
                .prose-preview ul { list-style: disc; }
                .prose-preview ol { list-style: decimal; }
                .prose-preview li input[type="checkbox"] { margin-right: 0.5em; accent-color: #6366f1; }
                .prose-preview table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.875em; }
                .prose-preview th, .prose-preview td { border: 1px solid var(--color-border, #d1d5db); padding: 0.5em 1em; text-align: left; }
                .prose-preview th { background: var(--color-muted, #f3f4f6); font-weight: 600; }
                .prose-preview hr { border: none; border-top: 2px solid var(--color-border, #e5e7eb); margin: 2em 0; }
                .prose-preview img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
            `}</style>
        </ToolLayout>
    );
}
