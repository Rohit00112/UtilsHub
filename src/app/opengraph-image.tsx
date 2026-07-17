import { ImageResponse } from 'next/og';

export const alt = 'FreeWebTools - free online web tools';
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
          <span>FreeWebTools</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Free online
            <br />
            web tools.
          </div>
          <div style={{ fontSize: 30, opacity: 0.7, lineHeight: 1.4 }}>
            PDF · Text · Image · Security · Calculators · Developer
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: 22, opacity: 0.6 }}>
          <span style={{ padding: '8px 16px', border: '1px solid #444', borderRadius: 8 }}>Free web tools</span>
          <span style={{ padding: '8px 16px', border: '1px solid #444', borderRadius: 8 }}>Local where possible</span>
          <span style={{ padding: '8px 16px', border: '1px solid #444', borderRadius: 8 }}>Free</span>
        </div>
      </div>
    ),
    size,
  );
}
