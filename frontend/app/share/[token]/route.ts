import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const apiUrl = 'https://api.snet.io.vn';
    const response = await fetch(`${apiUrl}/api/posts/share/${params.token}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      // For testing, return sample HTML
      const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bài viết trên SNet</title>
  <meta name="description" content="Xem bài viết trên SNet">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="Bài viết trên SNet">
  <meta property="og:description" content="Xem bài viết trên SNet">
  <meta property="og:image" content="https://snet.io.vn/logo.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://snet.io.vn/share/${params.token}">
  <meta property="og:site_name" content="SNet">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Bài viết trên SNet">
  <meta name="twitter:description" content="Xem bài viết trên SNet">
  <meta name="twitter:image" content="https://snet.io.vn/logo.png">
  
  <!-- Zalo -->
  <meta property="zalo:image" content="https://snet.io.vn/logo.png">
  
  <style>
    body { margin: 0; padding: 20px; font-family: sans-serif; background: #000; color: #fff; text-align: center; }
    a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <p>Bài viết không tồn tại</p>
  <p><a href="/">Về trang chủ</a></p>
</body>
</html>`;
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const post = await response.json();
    const title = `${post.author?.displayName || 'Người dùng'} trên SNet`;
    const description = (post.content || 'Xem bài viết trên SNet').substring(0, 200).replace(/"/g, '&quot;');
    const image = post.fileUrl || 'https://snet.io.vn/logo.png';
    const url = `https://snet.io.vn/share/${params.token}`;

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="SNet">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <!-- Zalo -->
  <meta property="zalo:image" content="${image}">
  
  <meta http-equiv="refresh" content="0;url=/share-view/${params.token}">
  <style>
    body { margin: 0; padding: 20px; font-family: sans-serif; background: #000; color: #fff; text-align: center; }
    a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <p>Đang chuyển hướng...</p>
  <p><a href="/share-view/${params.token}">Nhấn vào đây nếu không tự động chuyển</a></p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating share page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
