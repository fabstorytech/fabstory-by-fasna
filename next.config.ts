import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 2,
  },
  images: {
    // Disable Vercel's 1,000 monthly image optimization quota exhaustion.
    // Cloudinary already provides native global CDN caching, compression, and WebP delivery.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
