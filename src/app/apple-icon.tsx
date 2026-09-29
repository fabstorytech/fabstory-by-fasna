import { ImageResponse } from 'next/og';
import fs from 'node:fs';
import path from 'node:path';

// Route segment config
export const runtime = 'nodejs';

// Image metadata for Apple Touch Icon
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default async function AppleIcon() {
  let base64Logo = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      base64Logo = `data:image/png;base64,${logoData.toString('base64')}`;
    }
  } catch {
    // fallback if file read fails
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF8F5',
          borderRadius: '36px',
          border: '4px solid #C7A66A',
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        {base64Logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={base64Logo}
            alt="Fabstory Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <span
            style={{
              fontSize: '80px',
              fontFamily: 'serif',
              fontWeight: 'bold',
              color: '#23484A',
            }}
          >
            F
          </span>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
