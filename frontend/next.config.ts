import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static file serving
  serverExternalPackages: ['pg', 'bcrypt'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Serve uploads folder
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
