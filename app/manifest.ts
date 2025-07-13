// app/manifest.ts - PWA Manifest
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MINTOONS - AI Story Writing for Kids',
    short_name: 'MINTOONS',
    description: 'AI-powered story writing platform for children ages 2-18',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#8b5cf6',
    orientation: 'portrait',
    scope: '/',
    id: 'com.mintoons.app',
    categories: ['education', 'kids', 'writing'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Create Story',
        short_name: 'Create',
        description: 'Start writing a new story',
        url: '/dashboard/create-stories',
        icons: [{ src: '/icons/shortcut-create.png', sizes: '96x96' }],
      },
      {
        name: 'My Stories',
        short_name: 'Stories',
        description: 'View my stories',
        url: '/dashboard/my-stories',
        icons: [{ src: '/icons/shortcut-stories.png', sizes: '96x96' }],
      },
    ],
    screenshots: [
      {
        src: '/images/screenshots/desktop-dashboard.png',
        sizes: '1280x720',
        type: 'image/png',
      },
      {
        src: '/images/screenshots/mobile-writing.png',
        sizes: '375x812',
        type: 'image/png',
      },
    ],
  };
}
