'use client';

import { useState } from 'react';
import { Clipboard, Eraser, Fingerprint } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolPanel } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const algorithms: { name: HashAlgorithm; webCryptoName?: string }[] = [
    { name: 'MD5' }, // We'll implement MD5 separately as it's not in WebCrypto
    { name: 'SHA-1', webCryptoName: 'SHA-1' },
    { name: 'SHA-256', webCryptoName: 'SHA-256' },
    { name: 'SHA-384', webCryptoName: 'SHA-384' },
    { name: 'SHA-512', webCryptoName: 'SHA-512' },
];

// MD5 implementation (public domain)
function md5(inputString: string): string {
    function rotateLeft(value: number, shift: number): number {
        return (value << shift) | (value >>> (32 - shift));
    }

    function addUnsigned(x: number, y: number): number {
        const lsw = (x & 0xFFFF) + (y & 0xFFFF);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function F(x: number, y: number, z: number): number { return (x & y) | ((~x) & z); }
    function G(x: number, y: number, z: number): number { return (x & z) | (y & (~z)); }
    function H(x: number, y: number, z: number): number { return x ^ y ^ z; }
    function I(x: number, y: number, z: number): number { return y ^ (x | (~z)); }

    function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(string: string): number[] {
        const utf8String = unescape(encodeURIComponent(string));
        const len = utf8String.length;
        const numWords = (((len + 8) >> 6) + 1) * 16;
        const wordArray: number[] = new Array(numWords).fill(0);

        for (let i = 0; i < len; i++) {
            wordArray[i >> 2] |= utf8String.charCodeAt(i) << ((i % 4) * 8);
        }
        wordArray[len >> 2] |= 0x80 << ((len % 4) * 8);
        wordArray[numWords - 2] = len * 8;
        return wordArray;
    }

    function wordToHex(value: number): string {
        let hex = '';
        for (let i = 0; i <= 3; i++) {
            const byte = (value >>> (i * 8)) & 255;
            hex += byte.toString(16).padStart(2, '0');
        }
        return hex;
    }

    const x = convertToWordArray(inputString);
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

    const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    for (let k = 0; k < x.length; k += 16) {
        const AA = a, BB = b, CC = c, DD = d;

        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);

        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x04881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);

        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);

        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

export default function HashGenerator() {
    const [input, setInput] = useToolState('hash-generator', 'input', '');
    const [hashes, setHashes] = useToolState<Record<HashAlgorithm, string>>('hash-generator', 'hashes', {
        'MD5': '',
        'SHA-1': '',
        'SHA-256': '',
        'SHA-384': '',
        'SHA-512': '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [copiedAlgorithm, setCopiedAlgorithm] = useState<string | null>(null);

    const generateHashes = async () => {
        if (!input) {
            setHashes({
                'MD5': '',
                'SHA-1': '',
                'SHA-256': '',
                'SHA-384': '',
                'SHA-512': '',
            });
            return;
        }

        setIsLoading(true);

        const encoder = new TextEncoder();
        const data = encoder.encode(input);

        const newHashes: Record<HashAlgorithm, string> = {
            'MD5': '',
            'SHA-1': '',
            'SHA-256': '',
            'SHA-384': '',
            'SHA-512': '',
        };

        // Generate MD5 (using our implementation)
        newHashes['MD5'] = md5(input);

        // Generate SHA hashes using WebCrypto API
        for (const algo of algorithms) {
            if (algo.webCryptoName) {
                try {
                    const hashBuffer = await crypto.subtle.digest(algo.webCryptoName, data);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    newHashes[algo.name] = hashHex;
                } catch {
                    newHashes[algo.name] = 'Error generating hash';
                }
            }
        }

        setHashes(newHashes);
        setIsLoading(false);
    };

    const copyToClipboard = async (algorithm: HashAlgorithm) => {
        await navigator.clipboard.writeText(hashes[algorithm]);
        setCopiedAlgorithm(algorithm);
        setTimeout(() => setCopiedAlgorithm(null), 2000);
    };

    const clearAll = () => {
        setInput('');
        setHashes({
            'MD5': '',
            'SHA-1': '',
            'SHA-256': '',
            'SHA-384': '',
            'SHA-512': '',
        });
    };

    return (
        <ToolLayout
            title="Hash Generator"
            description="Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text"
            category="security"
        >
            <div className="mx-auto max-w-4xl space-y-6">
                <ToolPanel title="Input text" description="Hash text locally in your browser.">
                    <textarea
                        id="input"
                        className="min-h-40 w-full rounded-md border border-input bg-background px-4 py-3 font-mono text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Enter text to hash..."
                    />
                    <ToolActionBar className="mt-4">
                        <button onClick={generateHashes} disabled={isLoading} className="btn btn-primary gap-2">
                            <Fingerprint className="h-4 w-4" />
                            {isLoading ? 'Generating' : 'Generate hashes'}
                        </button>
                        <button onClick={clearAll} className="btn btn-secondary gap-2">
                            <Eraser className="h-4 w-4" />
                            Clear
                        </button>
                    </ToolActionBar>
                </ToolPanel>

                <div className="space-y-4">
                    {algorithms.map((algo) => (
                        <ToolPanel
                            key={algo.name}
                            title={algo.name}
                            actions={hashes[algo.name] && (
                                <button onClick={() => copyToClipboard(algo.name)} className="btn btn-secondary h-8 gap-2 px-3">
                                    <Clipboard className="h-4 w-4" />
                                    {copiedAlgorithm === algo.name ? 'Copied' : 'Copy'}
                                </button>
                            )}
                            className="p-4 sm:p-4"
                        >
                            <div className="flex min-h-12 items-center break-all rounded-md bg-muted/30 p-3 font-mono text-sm text-muted-foreground">
                                {hashes[algo.name] || 'Hash will appear here...'}
                            </div>
                        </ToolPanel>
                    ))}
                </div>

                <ToolPanel title="About hash functions">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><strong className="text-foreground">MD5:</strong> 128-bit hash, fast but not cryptographically secure</li>
                        <li><strong className="text-foreground">SHA-1:</strong> 160-bit hash, deprecated for security purposes</li>
                        <li><strong className="text-foreground">SHA-256:</strong> 256-bit hash, part of SHA-2 family, widely used</li>
                        <li><strong className="text-foreground">SHA-384:</strong> 384-bit hash, truncated version of SHA-512</li>
                        <li><strong className="text-foreground">SHA-512:</strong> 512-bit hash, strongest in SHA-2 family</li>
                    </ul>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
