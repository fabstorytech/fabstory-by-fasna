import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fabstory by Fasna — Sewing Fabulous Stories',
    short_name: 'Fabstory',
    description:
      'Premium handcrafted women\'s fashion. Custom-made outfits, ready-to-ship collections, and exquisite fabrics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F5EF',
    theme_color: '#23484A',
    icons: [
      {
        src: '/logo.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
