'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

export default function Base64Encoder() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [error, setError] = useState('');

    const handleEncode = () => {
        try {
            setError('');
            setOutputText(btoa(inputText));
        } catch (err) {
            setError('Failed to encode. Please check your input.');
        }
    };

    const handleDecode = () => {
        try {
            setError('');
            setOutputText(atob(inputText));
        } catch (err) {
            setError('Failed to decode. Invalid Base64 string.');
        }
    };

    const handleProcess = () => mode === 'encode' ? handleEncode() : handleDecode();
    const copyToClipboard = () => navigator.clipboard.writeText(outputText);
    const clearAll = () => { setInputText(''); setOutputText(''); setError(''); };

    return (
        <ToolLayout title="Base64 Encoder/Decoder" description="Encode text to Base64 or decode Base64 strings back to text" category="text">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Mode Selector */}
                <div className="flex gap-4">
                    <button className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('encode')}>Encode</button>
                    <button className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('decode')}>Decode</button>
                </div>

                {/* Input */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <label htmlFor="input" className="block text-lg font-semibold text-text-primary mb-3">
                        {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                    </label>
                    <textarea id="input" className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-base font-mono resize-none transition-all duration-150 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'} rows={8} />
                </div>

                {/* Controls */}
                <div className="flex gap-3">
                    <button onClick={handleProcess} className="btn btn-primary">{mode === 'encode' ? '🔒 Encode to Base64' : '🔓 Decode from Base64'}</button>
                    <button onClick={clearAll} className="btn btn-secondary">Clear All</button>
                </div>

                {/* Error */}
                {error && <div className="p-4 bg-error/10 border border-error/30 rounded-md text-error">⚠️ {error}</div>}

                {/* Output */}
                <div className="bg-bg-secondary border-2 border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                        <label htmlFor="output" className="text-lg font-semibold text-text-primary">{mode === 'encode' ? 'Encoded Base64' : 'Decoded Text'}</label>
                        {outputText && <button onClick={copyToClipboard} className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md text-primary-light font-semibold text-sm transition-all duration-150 hover:scale-105">📋 Copy</button>}
                    </div>
                    <textarea id="output" className="w-full px-4 py-3 bg-bg-tertiary border-2 border-border rounded-md text-text-primary text-base font-mono resize-none focus:outline-none placeholder:text-text-tertiary" value={outputText} readOnly placeholder="Result will appear here..." rows={8} />
                </div>
            </div>
        </ToolLayout>
    );
}
