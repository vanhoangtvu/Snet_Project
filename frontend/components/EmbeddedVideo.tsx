import { useState, useEffect, useRef } from 'react';
import { parseVideoUrl, VideoInfo } from '@/lib/videoUtils';
import { FiPlay, FiExternalLink } from 'react-icons/fi';

interface EmbeddedVideoProps {
  url: string;
  platform?: string;
  className?: string;
}

export default function EmbeddedVideo({ url, platform, className = '' }: EmbeddedVideoProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const info = parseVideoUrl(url);
    console.log('🎬 Parsing video URL:', url);
    console.log('📊 Video Info:', info);
    setVideoInfo(info);
  }, [url]);

  // Setup IntersectionObserver for autoplay
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            console.log('🎬 Video embed visible, will autoplay');
            setIsVisible(true);
          } else {
            console.log('⏸️ Video embed not visible, stopping');
            setIsVisible(false);
          }
        });
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: '0px'
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [videoInfo]);


  if (!videoInfo) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <FiExternalLink size={18} />
          <span className="text-sm">Xem video: {url}</span>
        </a>
      </div>
    );
  }

  // TikTok - Embed iframe (vertical video format)
  if (videoInfo.platform === 'tiktok') {
    return (
      <div ref={containerRef} className={`relative rounded-lg overflow-hidden group bg-black ${className}`}>
        {/* TikTok iframe - portrait/vertical format */}
        <div className="flex items-center justify-center bg-black min-h-[600px] max-h-[800px]">
          {isVisible ? (
            <iframe
              ref={iframeRef}
              key={isVisible ? 'visible' : 'hidden'} // Force re-render on visibility change
              src={`https://www.tiktok.com/embed/v2/${videoInfo.videoId}?lang=vi-VN&music_info=1&description=1&autoplay=1`}
              className="w-full h-full min-h-[600px] max-w-[340px] mx-auto"
              style={{ border: 'none', maxHeight: '800px' }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
              title="TikTok video player"
            />
          ) : (
            <div className="w-full h-full min-h-[600px] max-w-[340px] mx-auto flex items-center justify-center">
              <div className="text-white text-center">
                <FiPlay size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-50">Scroll để xem video</p>
              </div>
            </div>
          )}
        </div>
        
        {/* External Link - Hidden by default, show on hover */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white text-xs rounded-full flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100 duration-300"
        >
          <FiExternalLink size={12} />
          Mở TikTok
        </a>
        
        {/* TikTok Badge - Hidden by default, show on hover */}
        <div className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-pink-600 text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
          TikTok
        </div>
      </div>
    );
  }

  // YouTube, Vimeo, Dailymotion - Direct embed with autoplay
  console.log('▶️ Rendering iframe with embedUrl:', videoInfo.embedUrl);
  
  // Build autoplay URL based on platform
  const getAutoplayUrl = () => {
    if (!isVisible) return null; // Don't load iframe if not visible
    
    const baseUrl = videoInfo.embedUrl;
    if (videoInfo.platform === 'youtube') {
      // YouTube: add autoplay=1 (removed mute for audio)
      return baseUrl.includes('?') 
        ? `${baseUrl}&autoplay=1` 
        : `${baseUrl}?autoplay=1`;
    } else if (videoInfo.platform === 'vimeo') {
      // Vimeo: add autoplay=1 (removed muted for audio)
      return baseUrl.includes('?')
        ? `${baseUrl}&autoplay=1`
        : `${baseUrl}?autoplay=1`;
    } else if (videoInfo.platform === 'dailymotion') {
      // Dailymotion: add autoplay=1 (removed mute for audio)
      return baseUrl.includes('?')
        ? `${baseUrl}&autoplay=1`
        : `${baseUrl}?autoplay=1`;
    }
    return baseUrl;
  };

  const autoplayUrl = getAutoplayUrl();
  
  return (
    <div ref={containerRef} className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      <div className="aspect-video">
        {isVisible && autoplayUrl ? (
          <iframe
            ref={iframeRef}
            key={isVisible ? 'visible' : 'hidden'} // Force re-render on visibility change
            src={autoplayUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={`${videoInfo.platform} video player`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <FiPlay size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-50">Scroll để xem video</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Platform Badge - Hidden by default, show on hover */}
      <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {videoInfo.platform === 'youtube' && (
          <div className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">
            YouTube
          </div>
        )}
        {videoInfo.platform === 'vimeo' && (
          <div className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
            Vimeo
          </div>
        )}
        {videoInfo.platform === 'dailymotion' && (
          <div className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
            Dailymotion
          </div>
        )}
      </div>

      {/* External Link Button - Hidden by default, show on hover */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white text-xs rounded-full flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100 duration-300"
      >
        <FiExternalLink size={12} />
        Xem gốc
      </a>
    </div>
  );
}

