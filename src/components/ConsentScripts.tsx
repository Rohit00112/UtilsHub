'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export const CONSENT_STORAGE_KEY = 'freewebtools-cookie-consent';
export const CONSENT_EVENT = 'freewebtools-consent';

export default function ConsentScripts({
  gaId,
}: {
  gaId: string;
}) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    try {
      setAllowed(localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted');
    } catch {
      setAllowed(false);
    }

    const handleConsent = (event: Event) => {
      setAllowed((event as CustomEvent<string>).detail === 'accepted');
    };
    window.addEventListener(CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
      <Script id="ms-clarity" strategy="lazyOnload">
        {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "xmmy8i6fh8");`}
      </Script>
    </>
  );
}
