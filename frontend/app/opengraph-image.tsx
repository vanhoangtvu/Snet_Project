import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'PixShare - Share Photos, Videos and Chat';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Open Graph Image
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 30%, #ec4899 70%, #f97316 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '80px',
        }}
      >
        {/* Floating shapes background */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '80px',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '100px',
            width: '250px',
            height: '250px',
            background: 'rgba(255,200,0,0.2)',
            borderRadius: '30%',
            filter: 'blur(50px)',
            transform: 'rotate(45deg)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <svg width="180" height="180" viewBox="0 0 64 64" fill="none">
            {/* Background glow */}
            <circle cx="32" cy="32" r="30" fill="white" opacity="0.2" />
            
            {/* Main circle */}
            <circle cx="32" cy="32" r="28" fill="white" opacity="0.95" />
            
            {/* Camera body */}
            <g transform="translate(16, 18)">
              <rect x="2" y="6" width="28" height="20" rx="4" fill="#8b5cf6" opacity="0.2" />
              
              {/* Lens */}
              <circle cx="16" cy="16" r="8" fill="#6366f1" />
              <circle cx="16" cy="16" r="6" fill="#a855f7" />
              <circle cx="16" cy="16" r="3" fill="white" opacity="0.8" />
              
              {/* Flash */}
              <circle cx="25" cy="10" r="2" fill="#f59e0b" />
              
              {/* Viewfinder */}
              <rect x="10" y="2" width="12" height="4" rx="2" fill="#8b5cf6" opacity="0.8" />
            </g>

            {/* Share icon */}
            <g transform="translate(42, 10)">
              <circle cx="6" cy="6" r="8" fill="#f59e0b" />
              <path
                d="M6 3 L9 5.5 L6 8 L6 6 L3 6 L3 5 L6 5 Z"
                fill="white"
                strokeWidth="0.5"
              />
              <circle cx="9.5" cy="5.5" r="1.5" fill="white" />
            </g>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px',
            textAlign: 'center',
            letterSpacing: '-2px',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          PixShare
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '36px',
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: '1.4',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          Chia sẻ ảnh, video và trò chuyện với bạn bè
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '50px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255,255,255,0.2)',
              padding: '16px 32px',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ fontSize: '32px' }}>📸</span>
            <span style={{ fontSize: '28px', color: 'white', fontWeight: '600' }}>Photos</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255,255,255,0.2)',
              padding: '16px 32px',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ fontSize: '32px' }}>🎥</span>
            <span style={{ fontSize: '28px', color: 'white', fontWeight: '600' }}>Videos</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255,255,255,0.2)',
              padding: '16px 32px',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ fontSize: '32px' }}>💬</span>
            <span style={{ fontSize: '28px', color: 'white', fontWeight: '600' }}>Chat</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

