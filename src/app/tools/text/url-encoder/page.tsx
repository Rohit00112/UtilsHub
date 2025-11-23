'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function URLEncoder() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');

    const handleProcess = () => {
        try {
            setOutputText(mode === 'encode' ? encodeURIComponent(inputText) : decodeURIComponent(inputText));
        } catch (e) {
            setOutputText('Error decoding URL');
        }
    };

    const copyToClipboard = () => navigator.clipboard.writeText(outputText);
    const clearAll = () => { setInputText(''); setOutputText(''); };

    return (
        <ToolLayout title="URL Encoder/Decoder" description="Encode URLs for safe transmission or decode URL-encoded strings" category="text">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex gap-4">
                    <button className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('encode')}>Encode</button>
                    <button className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('decode')}>Decode</button>
                </div>
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <label htmlFor="input" className="block text-lg font-semibold text-text-primary mb-3">{mode === 'encode' ? 'URL to Encode' : 'URL to Decode'}</label>
                    <textarea id="input" className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-base font-mono resize-none transition-all duration-150 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={mode === 'encode' ? 'Enter URL to encode...' : 'Enter encoded URL to decode...'} rows={8} />
                </div>
                <div className="flex gap-3">
                    <button onClick={handleProcess} className="btn btn-primary">{mode === 'encode' ? '🔒 Encode URL' : '🔓 Decode URL'}</button>
                    <button onClick={clearAll} className="btn btn-secondary">Clear All</button>
                </div>
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                        <label htmlFor="output" className="text-lg font-semibold text-text-primary">{mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}</label>
                        {outputText && <button onClick={copyToClipboard} className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md text-primary-light font-semibold text-sm transition-all duration-150 hover:scale-105">📋 Copy</button>}
                    </div>
                    <textarea id="output" className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-base font-mono resize-none focus:outline-none placeholder:text-text-tertiary" value={outputText} readOnly placeholder="Result will appear here..." rows={8} />
                </div>
            </div>
        </ToolLayout>
    );
}
