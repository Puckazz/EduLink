import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    if (!apiProxyTarget) {
      return [];
    }

    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiProxyTarget.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
