import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: { NEXT_PUBLIC_TRIVIA_BUILD_AT: process.env.NEXT_PUBLIC_TRIVIA_BUILD_AT || new Date().toISOString() },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
      { key: 'X-DNS-Prefetch-Control', value: 'off' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
      { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' }
    ];
    // Only advertise HTTPS persistence for the real production domain.
    // Avoid includeSubDomains/preload without auditing all subdomains first.
    if (process.env.VERCEL_ENV === 'production') {
      securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000' });
    }
    return [{ source: '/:path*', headers: securityHeaders }];
  }
};
export default nextConfig;
