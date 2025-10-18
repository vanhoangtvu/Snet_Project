import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// Apple Touch Icon
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #ec4899 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            width: '160px',
            height: '160px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.3) 100%)',
            borderRadius: '50%',
            filter: 'blur(20px)',
          }}
        />

        {/* Camera Icon */}
        <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
          {/* Main circle */}
          <circle cx="32" cy="32" r="28" fill="white" opacity="0.15" />
          
          {/* Camera body */}
          <g transform="translate(12, 14) scale(1.3)">
            <rect x="2" y="6" width="28" height="20" rx="4" fill="white" opacity="0.95" />
            
            {/* Lens */}
            <circle cx="16" cy="16" r="8" fill="#6366f1" />
            <circle cx="16" cy="16" r="6" fill="#a855f7" />
            <circle cx="16" cy="16" r="3" fill="white" opacity="0.8" />
            
            {/* Flash */}
            <circle cx="25" cy="10" r="2" fill="#f59e0b" />
            
            {/* Viewfinder */}
            <rect x="10" y="2" width="12" height="4" rx="2" fill="white" opacity="0.9" />
          </g>

          {/* Share icon */}
          <g transform="translate(42, 10)">
            <circle cx="6" cy="6" r="7" fill="#f59e0b" opacity="0.95" />
            <path
              d="M6 3 L8.5 5.5 L6 8 L6 6 L3.5 6 L3.5 5 L6 5 Z"
              fill="white"
              strokeWidth="0.5"
            />
            <circle cx="9" cy="5.5" r="1.5" fill="white" />
          </g>

          {/* Sparkles */}
          <circle cx="12" cy="14" r="1.5" fill="white" opacity="0.8" />
          <circle cx="52" cy="50" r="1.5" fill="white" opacity="0.8" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

