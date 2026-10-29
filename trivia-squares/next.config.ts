import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: { NEXT_PUBLIC_TRIVIA_BUILD_AT: process.env.NEXT_PUBLIC_TRIVIA_BUILD_AT || new Date().toISOString() },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        { key: 'X-DNS-Prefetch-Control', value: 'off' },
        { key: 'Cross-Origin-Resource-Policy', value: 'same-site' }
      ]
    }];
  }
};
export default nextConfig;
