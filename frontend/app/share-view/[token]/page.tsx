import { Metadata } from 'next';
import SharePageClient from './SharePageClient';
import { headers } from 'next/headers';

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  try {
    const apiUrl = 'https://api.snet.io.vn';
    const response = await fetch(`${apiUrl}/api/posts/share/${params.token}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const post = await response.json();
      const title = `${post.author?.displayName || 'Người dùng'} trên SNet`;
      const description = post.content?.substring(0, 200) || 'Xem bài viết trên SNet';
      const image = post.fileUrl || 'https://snet.io.vn/logo.png';
      const url = `https://snet.io.vn/share/${params.token}`;
      
      return {
        title,
        description,
        metadataBase: new URL('https://snet.io.vn'),
        openGraph: {
          title,
          description,
          images: [{ url: image, width: 1200, height: 630, alt: title }],
          type: 'article',
          siteName: 'SNet',
          url,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [image],
        },
        other: {
          'og:image': image,
          'og:image:width': '1200',
          'og:image:height': '630',
        }
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error);
  }
  
  return {
    title: 'SNet - Mạng xã hội',
    description: 'Xem bài viết trên SNet',
    metadataBase: new URL('https://snet.io.vn'),
  };
}

export default function SharePage({ params }: { params: { token: string } }) {
  return <SharePageClient token={params.token} />;
}

export const dynamic = 'force-dynamic';
