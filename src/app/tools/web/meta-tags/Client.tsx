'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Eraser, Wand2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
    ToolStatus,
} from '@/components/tools/ToolPrimitives';

type RobotsMode = 'index-follow' | 'noindex-follow' | 'noindex-nofollow';
type CardType = 'summary' | 'summary_large_image';

const robotsOptions: Array<{ label: string; value: RobotsMode }> = [
    { label: 'Index', value: 'index-follow' },
    { label: 'Noindex', value: 'noindex-follow' },
    { label: 'Private', value: 'noindex-nofollow' },
];

const cardOptions: Array<{ label: string; value: CardType }> = [
    { label: 'Summary', value: 'summary' },
    { label: 'Large image', value: 'summary_large_image' },
];

const sample = {
    title: 'Free Web Tools for Everyday Work',
    description: 'Format data, resize images, inspect tokens, and generate web metadata with free browser-based tools.',
    url: 'https://freewebtools.app/tools/web/meta-tags',
    image: 'https://freewebtools.app/opengraph-image',
    siteName: 'FreeWebTools',
    twitter: '@freewebtools',
};

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function robotsContent(mode: RobotsMode) {
    if (mode === 'noindex-follow') return 'noindex, follow';
    if (mode === 'noindex-nofollow') return 'noindex, nofollow';
    return 'index, follow';
}

export default function MetaTagGenerator() {
    const [title, setTitle] = useState(sample.title);
    const [description, setDescription] = useState(sample.description);
    const [url, setUrl] = useState(sample.url);
    const [image, setImage] = useState(sample.image);
    const [siteName, setSiteName] = useState(sample.siteName);
    const [twitter, setTwitter] = useState(sample.twitter);
    const [robots, setRobots] = useState<RobotsMode>('index-follow');
    const [card, setCard] = useState<CardType>('summary_large_image');
    const [copied, setCopied] = useState(false);

    const output = useMemo(() => {
        const tags = [
            ['title', title],
            ['meta name="description"', description],
            ['link rel="canonical"', url],
            ['meta name="robots"', robotsContent(robots)],
            ['meta property="og:type"', 'website'],
            ['meta property="og:title"', title],
            ['meta property="og:description"', description],
            ['meta property="og:url"', url],
            ['meta property="og:image"', image],
            ['meta property="og:site_name"', siteName],
            ['meta name="twitter:card"', card],
            ['meta name="twitter:title"', title],
            ['meta name="twitter:description"', description],
            ['meta name="twitter:image"', image],
            ['meta name="twitter:site"', twitter],
        ];

        return tags
            .filter(([, value]) => value.trim())
            .map(([tag, value]) => {
                const escaped = escapeHtml(value.trim());
                if (tag === 'title') return `<title>${escaped}</title>`;
                if (tag.startsWith('link')) return `<${tag} href="${escaped}" />`;
                return `<${tag} content="${escaped}" />`;
            })
            .join('\n');
    }, [card, description, image, robots, siteName, title, twitter, url]);

    const copyOutput = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const loadSample = () => {
        setTitle(sample.title);
        setDescription(sample.description);
        setUrl(sample.url);
        setImage(sample.image);
        setSiteName(sample.siteName);
        setTwitter(sample.twitter);
        setRobots('index-follow');
        setCard('summary_large_image');
        setCopied(false);
    };

    const clearAll = () => {
        setTitle('');
        setDescription('');
        setUrl('');
        setImage('');
        setSiteName('');
        setTwitter('');
        setCopied(false);
    };

    return (
        <ToolLayout title="Meta Tag Generator" description="Generate SEO, Open Graph, and Twitter card tags" category="web">
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Page metadata">
                    <div className="grid gap-4 md:grid-cols-2">
                        <TextInput label="Title" value={title} onChange={setTitle} placeholder="Page title" />
                        <TextInput label="Canonical URL" value={url} onChange={setUrl} placeholder="https://example.com/page" />
                        <div className="md:col-span-2">
                            <TextInput label="Description" value={description} onChange={setDescription} placeholder="Page summary for search and social previews" />
                        </div>
                        <TextInput label="Image URL" value={image} onChange={setImage} placeholder="https://example.com/image.png" />
                        <TextInput label="Site name" value={siteName} onChange={setSiteName} placeholder="Site name" />
                        <TextInput label="Twitter site" value={twitter} onChange={setTwitter} placeholder="@handle" />
                    </div>
                </ToolPanel>

                <ToolPanel title="Robots and social card">
                    <div className="flex flex-wrap gap-5">
                        <ToolField label="Robots">
                            <ToolSegmentedControl value={robots} options={robotsOptions} onChange={setRobots} />
                        </ToolField>
                        <ToolField label="Twitter card">
                            <ToolSegmentedControl value={card} options={cardOptions} onChange={setCard} />
                        </ToolField>
                    </div>
                </ToolPanel>

                {(title.length > 60 || description.length > 160) && (
                    <ToolStatus tone="warning">
                        Search snippets vary, but titles over 60 characters or descriptions over 160 characters may truncate.
                    </ToolStatus>
                )}

                <ToolActionBar>
                    <button type="button" onClick={copyOutput} disabled={!output} className="btn btn-primary gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy tags'}
                    </button>
                    <button type="button" onClick={loadSample} className="btn btn-secondary gap-2">
                        <Wand2 className="h-4 w-4" />
                        Sample
                    </button>
                    <button type="button" onClick={clearAll} className="btn btn-secondary gap-2">
                        <Eraser className="h-4 w-4" />
                        Clear
                    </button>
                </ToolActionBar>

                <ToolPanel title="Generated tags">
                    <pre className="min-h-72 overflow-auto rounded-md border bg-muted/20 p-4 font-mono text-sm leading-6 text-foreground whitespace-pre-wrap">
                        {output || 'Generated tags will appear here...'}
                    </pre>
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ToolMetric label="Title length" value={title.length} />
                    <ToolMetric label="Description length" value={description.length} />
                    <ToolMetric label="Generated tags" value={output ? output.split('\n').length : 0} />
                </div>
            </div>
        </ToolLayout>
    );
}

function TextInput({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    return (
        <ToolField label={label}>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="input h-10 font-mono"
            />
        </ToolField>
    );
}
