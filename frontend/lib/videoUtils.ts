// Video URL parsing utilities

export interface VideoInfo {
  platform: 'youtube' | 'tiktok' | 'vimeo' | 'dailymotion' | 'other';
  embedUrl: string;
  originalUrl: string;
  videoId?: string;
}

/**
 * Parse YouTube URL and return embed URL
 */
export function parseYouTubeUrl(url: string): VideoInfo | null {
  // Match various YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`,
        originalUrl: url,
        videoId: match[1],
      };
    }
  }

  return null;
}

/**
 * Parse TikTok URL and return embed URL
 */
export function parseTikTokUrl(url: string): VideoInfo | null {
  // Match TikTok URL patterns
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/v\/(\d+)/,
    /(?:https?:\/\/)?vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      // TikTok embed URL
      return {
        platform: 'tiktok',
        embedUrl: url, // TikTok requires oEmbed API, we'll use direct URL
        originalUrl: url,
        videoId: match[1],
      };
    }
  }

  return null;
}

/**
 * Parse Vimeo URL and return embed URL
 */
export function parseVimeoUrl(url: string): VideoInfo | null {
  const pattern = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
  const match = url.match(pattern);

  if (match && match[1]) {
    return {
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1&playsinline=1`,
      originalUrl: url,
      videoId: match[1],
    };
  }

  return null;
}

/**
 * Parse Dailymotion URL and return embed URL
 */
export function parseDailymotionUrl(url: string): VideoInfo | null {
  const pattern = /(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]+)/;
  const match = url.match(pattern);

  if (match && match[1]) {
    return {
      platform: 'dailymotion',
      embedUrl: `https://www.dailymotion.com/embed/video/${match[1]}?autoplay=1&mute=1&playsinline=1`,
      originalUrl: url,
      videoId: match[1],
    };
  }

  return null;
}

/**
 * Main function to parse any supported video URL
 */
export function parseVideoUrl(url: string): VideoInfo | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Try YouTube
  const youtube = parseYouTubeUrl(url);
  if (youtube) return youtube;

  // Try TikTok
  const tiktok = parseTikTokUrl(url);
  if (tiktok) return tiktok;

  // Try Vimeo
  const vimeo = parseVimeoUrl(url);
  if (vimeo) return vimeo;

  // Try Dailymotion
  const dailymotion = parseDailymotionUrl(url);
  if (dailymotion) return dailymotion;

  return null;
}

/**
 * Detect if a string contains a video URL
 */
export function detectVideoUrl(text: string): string | null {
  if (!text) return null;

  // Simple regex to find URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlPattern);

  if (!matches) return null;

  for (const url of matches) {
    const videoInfo = parseVideoUrl(url);
    if (videoInfo) {
      return url;
    }
  }

  return null;
}

/**
 * Check if URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null;
}

