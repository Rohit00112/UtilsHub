import { ImageResponse } from 'next/og';
import { siteName } from '@/lib/seo';

export const runtime = 'edge';

// Dynamic Open Graph image: /og?title=...&sub=...&tag=...
// Referenced from per-page metadata so every tool/category shares a unique card.
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Free online web tools').slice(0, 90);
  const sub =
    (searchParams.get('sub') || 'PDF · Text · Image · Security · Calculators · Developer').slice(0, 120);
  const tag = (searchParams.get('tag') || 'Free web tools').slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#0a0a0a',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 28, opacity: 0.8 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#fafafa',
              color: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            F
          </div>
          <span>{siteName}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            {title}
          </div>
          <div style={{ fontSize: 30, opacity: 0.7, lineHeight: 1.4 }}>{sub}</div>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: 22, opacity: 0.6 }}>
          <span style={{ padding: '8px 16px', border: '1px solid #444', borderRadius: 8 }}>{tag}</span>
          <span style={{ padding: '8px 16px', border: '1px solid #444', borderRadius: 8 }}>No sign-up</span>
          <span style={{ padding: '8px 16px', border: '1px solid #444', borderRadius: 8 }}>Free</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
