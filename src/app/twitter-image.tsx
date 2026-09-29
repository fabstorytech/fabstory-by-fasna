import { ImageResponse } from 'next/og';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const alt = 'Fabstory by Fasna — Sewing Fabulous Stories';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function TwitterImage() {
  let base64Logo = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      base64Logo = `data:image/png;base64,${logoData.toString('base64')}`;
    }
  } catch {
    // fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF8F5',
          border: '14px solid #23484A',
          padding: '48px',
        }}
      >
        {base64Logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={base64Logo}
            alt="Fabstory by Fasna"
            style={{
              maxWidth: '680px',
              maxHeight: '380px',
              objectFit: 'contain',
            }}
          />
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '28px',
          }}
        >
          <div style={{ width: '40px', height: '2px', background: '#C7A66A' }} />
          <span
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#23484A',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            Bespoke Couture • Handcrafted in Kerala • Custom Tailoring
          </span>
          <div style={{ width: '40px', height: '2px', background: '#C7A66A' }} />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
