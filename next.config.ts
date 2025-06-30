import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Skip type checking during build - useful for CI/CD
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Optimize images
  images: {
    unoptimized: false,
  },
  
  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Enable experimental features if needed
  experimental: {
    // Uncomment if using these optimizations
    // optimizePackageImports: ['lucide-react'],
  },
  
  // Webpack config (if needed for custom optimizations)
  webpack: (config, { isServer }) => {
    // Custom webpack modifications can go here
    return config;
  },
};

export default nextConfig;
