/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Standalone frontend: no workspace packages to transpile
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Content Security Policy: allow backend API (localhost + live) and required sources
  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const connectSources = [
      "'self'",
      'http://localhost:4000',
      'https://api.agora-schools.com',
    ];
    if (apiUrl && !connectSources.includes(apiUrl)) {
      connectSources.push(apiUrl);
    }
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `connect-src ${connectSources.join(' ')}`,
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  // --- ADD THIS BLOCK TO IGNORE ERRORS ---
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Redirect legacy /teachers routes to /staff (staff is now the canonical section)
  async redirects() {
    return [
      { source: '/dashboard/school/teachers', destination: '/dashboard/school/staff', permanent: true },
      { source: '/dashboard/school/teachers/add', destination: '/dashboard/school/staff/add', permanent: true },
      { source: '/dashboard/school/teachers/:id', destination: '/dashboard/school/staff/:id', permanent: true },
    ];
  },
  // ---------------------------------------
};

module.exports = nextConfig;

