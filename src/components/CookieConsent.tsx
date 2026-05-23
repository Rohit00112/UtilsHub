'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

const STORAGE_KEY = 'utilshub-cookie-consent';
const ADSENSE_CLIENT_ID = 'ca-pub-9243015758853816';

type ConsentState = 'unknown' | 'accepted' | 'declined';

export default function CookieConsent() {
    const [consent, setConsent] = useState<ConsentState>('unknown');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'accepted' || stored === 'declined') {
                setConsent(stored);
            }
        } catch {
            // localStorage blocked — treat as unknown
        }
    }, []);

    const persist = (value: 'accepted' | 'declined') => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            // ignore
        }
        setConsent(value);
    };

    if (!mounted) return null;

    return (
        <>
            {consent === 'accepted' && (
                <Script
                    id="adsense-init"
                    async
                    strategy="afterInteractive"
                    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
                    crossOrigin="anonymous"
                />
            )}

            {consent === 'unknown' && (
                <div
                    role="dialog"
                    aria-live="polite"
                    aria-label="Cookie consent"
                    className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-lg border bg-background p-4 shadow-lg sm:p-5"
                >
                    <p className="text-sm leading-6 text-foreground">
                        UtilsHub uses Google AdSense to display ads, which sets cookies and may collect data per Google&apos;s policies. Tool input you paste or upload stays in your browser. See our{' '}
                        <Link href="/privacy" className="font-medium underline underline-offset-2">
                            privacy policy
                        </Link>{' '}
                        for details.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            onClick={() => persist('accepted')}
                            className="btn btn-primary h-9 px-4 text-sm"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => persist('declined')}
                            className="btn btn-secondary h-9 px-4 text-sm"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
