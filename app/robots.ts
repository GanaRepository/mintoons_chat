// app/robots.ts - Robots.txt Generation
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://mintoons.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/contact',
          '/privacy',
          '/terms',
          '/explore-stories',
          '/pricing',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/mentor/',
          '/api/',
          '/_next/',
          '/unauthorized',
          '/story/',
          '/profile/',
          '/my-stories/',
          '/progress/',
          '/reset-password/',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about',
          '/contact',
          '/privacy',
          '/terms',
          '/explore-stories',
          '/pricing',
          '/*.css',
          '/*.js',
          '/*.png',
          '/*.jpg',
          '/*.jpeg',
          '/*.gif',
          '/*.webp',
          '/*.svg',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/mentor/',
          '/api/',
          '/_next/',
          '/unauthorized',
          '/story/',
          '/profile/',
          '/my-stories/',
          '/progress/',
          '/reset-password/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
