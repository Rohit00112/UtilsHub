'use client';

import { Clipboard, FileText, RefreshCw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolEmptyState,
    ToolField,
    ToolPanel,
    ToolSegmentedControl,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
type LoremMode = 'paragraphs' | 'sentences' | 'words';

export default function LoremIpsumGenerator() {
    const [mode, setMode] = useToolState<LoremMode>('lorem-ipsum', 'mode', 'paragraphs');
    const [count, setCount] = useToolState('lorem-ipsum', 'count', 3);
    const [startWithLorem, setStartWithLorem] = useToolState('lorem-ipsum', 'startWithLorem', true);
    const [generatedText, setGeneratedText] = useToolState('lorem-ipsum', 'generatedText', '');

    const generateWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

    const generateSentence = (minWords = 5, maxWords = 15) => {
        const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
        const words = Array.from({ length: wordCount }, generateWord);
        const sentence = words.join(' ');
        return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    };

    const generateParagraph = (minSentences = 4, maxSentences = 8) => {
        const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
        return Array.from({ length: sentenceCount }, () => generateSentence()).join(' ');
    };

    const generate = () => {
        let result = '';

        if (mode === 'words') {
            const words = startWithLorem ? LOREM_START.split(' ').slice(0, Math.min(count, 5)) : [];
            while (words.length < count) words.push(generateWord());
            result = words.join(' ');
        } else if (mode === 'sentences') {
            const sentences = startWithLorem ? [LOREM_START + '.'] : [];
            while (sentences.length < count) sentences.push(generateSentence());
            result = sentences.join(' ');
        } else {
            const paragraphs = startWithLorem ? [LOREM_START + '. ' + generateParagraph(3, 6)] : [];
            while (paragraphs.length < count) paragraphs.push(generateParagraph());
            result = paragraphs.join('\n\n');
        }

        setGeneratedText(result);
    };

    return (
        <ToolLayout
            title="Lorem Ipsum Generator"
            description="Generate placeholder text for designs, layouts, and mockups"
            category="developer"
        >
            <div className="mx-auto max-w-4xl space-y-6">
                <ToolPanel title="Generator settings">
                    <div className="grid gap-4 md:grid-cols-[1fr_160px_1fr]">
                        <ToolField label="Type">
                            <ToolSegmentedControl
                                value={mode}
                                onChange={setMode}
                                options={[
                                    { label: 'Paragraphs', value: 'paragraphs' },
                                    { label: 'Sentences', value: 'sentences' },
                                    { label: 'Words', value: 'words' },
                                ]}
                            />
                        </ToolField>
                        <ToolField label="Count">
                            <input
                                type="number"
                                min="1"
                                max={mode === 'words' ? 1000 : mode === 'sentences' ? 100 : 20}
                                value={count}
                                onChange={(event) => setCount(Number(event.target.value))}
                                className="input"
                            />
                        </ToolField>
                        <label className="flex items-end gap-2 pb-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={startWithLorem}
                                onChange={(event) => setStartWithLorem(event.target.checked)}
                                className="h-4 w-4 rounded border-border"
                            />
                            Start with &quot;Lorem ipsum&quot;
                        </label>
                    </div>
                    <ToolActionBar className="mt-5">
                        <button onClick={generate} className="btn btn-primary gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Generate
                        </button>
                    </ToolActionBar>
                </ToolPanel>

                <ToolPanel
                    title="Generated text"
                    actions={generatedText && <button onClick={() => navigator.clipboard.writeText(generatedText)} className="btn btn-secondary h-8 gap-2 px-3"><Clipboard className="h-4 w-4" />Copy</button>}
                >
                    {generatedText ? (
                        <>
                            <div className="rounded-md border bg-muted/20 p-4 text-sm leading-7 whitespace-pre-wrap text-foreground">
                                {generatedText}
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground tabular-nums">
                                {mode === 'words' && `${generatedText.split(' ').length} words`}
                                {mode === 'sentences' && `${generatedText.split('. ').length} sentences`}
                                {mode === 'paragraphs' && `${generatedText.split('\n\n').length} paragraphs`}
                                {' - '}
                                {generatedText.length} characters
                            </p>
                        </>
                    ) : (
                        <ToolEmptyState
                            icon={<FileText className="h-8 w-8" />}
                            title="No text generated"
                            description="Choose the settings and generate placeholder copy."
                        />
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
