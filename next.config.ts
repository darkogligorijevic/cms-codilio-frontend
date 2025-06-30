import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // ⚠️ KRITIČNO: Dodaj trailingSlash za Docker kompatibilnost
  trailingSlash: false,
  
  // ⚠️ NOVO: Asset prefix za static fajlove u Docker-u
  assetPrefix: '',
  
  // Skip type checking during build - useful for CI/CD
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ⚠️ IZMENA: Optimizuj images za Docker
  images: {
    unoptimized: true, // Promeni na true za Docker
    domains: ['localhost'], // Dodaj dozvoljene domene
  },
  
  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // ⚠️ NOVO: Kompresija za produkciju
  compress: true,
  
  // ⚠️ NOVO: Powered by header
  poweredByHeader: false,
  
  // ⚠️ NOVO: Optimizacije za produkciju
  swcMinify: true,
  
  // Enable experimental features if needed
  experimental: {
    // ⚠️ NOVO: Optimizacije za standalone
    outputFileTracingRoot: undefined,
    // Uncomment if using these optimizations
    // optimizePackageImports: ['lucide-react'],
  },
  
  // ⚠️ NOVO: Headers za static assets
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Webpack config (if needed for custom optimizations)
  webpack: (config, { isServer }) => {
    // Custom webpack modifications can go here
    return config;
  },
};

export default nextConfig;
