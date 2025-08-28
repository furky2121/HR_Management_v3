/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  // Enable dynamic rendering for all pages
  experimental: {
    // App directory is now stable in Next.js 14
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bilgelojistik-api.onrender.com/api',
    NEXT_PUBLIC_FILE_BASE_URL: process.env.NEXT_PUBLIC_FILE_BASE_URL || 'https://bilgelojistik-api.onrender.com',
  },
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  // Image optimization
  images: {
    domains: [
      'localhost',
      'bilgelojistik-api.onrender.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Compression
  compress: true,
  // Static file optimization
  generateEtags: true,
}

module.exports = nextConfig
