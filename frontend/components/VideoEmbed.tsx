'use client';

interface VideoEmbedProps {
  url: string;
  platform?: string;
  className?: string;
}

export default function VideoEmbed({ url, platform, className = '' }: VideoEmbedProps) {
  if (!url) return null;

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    if (videoId) {
      return (
        <iframe
          width="100%"
          height="400"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={className}
        />
      );
    }
  }

  // TikTok
  if (url.includes('tiktok.com')) {
    let videoId = '';
    if (url.includes('/video/')) {
      videoId = url.split('/video/')[1]?.split('?')[0] || '';
    }
    if (videoId) {
      return (
        <div className={`flex justify-center ${className}`}>
          <iframe
            src={`https://www.tiktok.com/embed/v/${videoId}`}
            width="325"
            height="600"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      );
    }
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    let videoId = '';
    if (url.includes('vimeo.com/')) {
      videoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
    }
    if (videoId) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          width="100%"
          height="400"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className={className}
        />
      );
    }
  }

  // Dailymotion
  if (url.includes('dailymotion.com')) {
    let videoId = '';
    if (url.includes('/video/')) {
      videoId = url.split('/video/')[1]?.split('_')[0] || '';
    }
    if (videoId) {
      return (
        <iframe
          src={`https://www.dailymotion.com/embed/video/${videoId}`}
          width="100%"
          height="400"
          frameBorder="0"
          allow="autoplay"
          allowFullScreen
          className={className}
        />
      );
    }
  }

  // Fallback - link
  return (
    <div className={`bg-gray-800 p-4 rounded-lg text-center ${className}`}>
      <p className="text-gray-400 mb-2">{platform || 'Video'}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
        Xem video
      </a>
    </div>
  );
}
