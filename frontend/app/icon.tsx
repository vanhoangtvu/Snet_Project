import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

// Favicon
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #ec4899 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '8px',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" fill="white" opacity="0.2" />
          <g transform="translate(16, 18)">
            <rect x="2" y="6" width="28" height="20" rx="4" fill="white" opacity="0.95" />
            <circle cx="16" cy="16" r="8" fill="#6366f1" />
            <circle cx="16" cy="16" r="6" fill="#a855f7" />
            <circle cx="16" cy="16" r="3" fill="white" opacity="0.5" />
            <circle cx="25" cy="10" r="2" fill="#f59e0b" />
            <rect x="10" y="2" width="12" height="4" rx="2" fill="white" opacity="0.9" />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

