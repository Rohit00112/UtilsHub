import { ImageResponse } from 'next/og';

export const alt = 'FreeWebTools — free online tools for PDFs, images, text, and developers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: '#070b1a',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(99,102,241,.42), rgba(99,102,241,0) 68%)',
            top: -320,
            right: -120,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(6,182,212,.24), rgba(6,182,212,0) 68%)',
            bottom: -300,
            left: 120,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 28, fontWeight: 700 }}>
          <svg width="52" height="52" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="brand" x1="14" y1="18" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="17" fill="#0b1020" />
            <rect x=".75" y=".75" width="62.5" height="62.5" rx="16.25" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="1.5" />
            <path d="M15 18v15.5C15 44.3 22.3 51 32 51s17-6.7 17-17.5V18" fill="none" stroke="url(#brand)" strokeLinecap="round" strokeWidth="7" />
            <path d="M32 34V18m0 16-9-7m9 7 9-7" fill="none" stroke="#f8fafc" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
            <circle cx="32" cy="34" r="4.25" fill="#f8fafc" />
          </svg>
          <span>FreeWeb<span style={{ color: '#818cf8' }}>Tools</span></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: '-0.045em',
            }}
          >
            <span>Free online tools.</span>
            <span style={{ color: '#a5b4fc' }}>Work that can’t wait.</span>
          </div>
          <div style={{ fontSize: 27, color: '#94a3b8', lineHeight: 1.4 }}>
            PDF · Image · Text · Developer · Security · API
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: 19, color: '#cbd5e1', zIndex: 1 }}>
          <span style={{ padding: '9px 16px', border: '1px solid #334155', borderRadius: 999 }}>60+ tools</span>
          <span style={{ padding: '9px 16px', border: '1px solid #334155', borderRadius: 999 }}>No sign-up</span>
          <span style={{ padding: '9px 16px', border: '1px solid #334155', borderRadius: 999 }}>Local-first</span>
        </div>
      </div>
    ),
    size,
  );
}
