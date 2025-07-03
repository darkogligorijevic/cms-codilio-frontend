import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 🚀 KRITIČNO: Enable standalone output for Docker
  output: 'standalone',
  
  // Skip type checking during build - useful for CI/CD
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 🌐 Environment variables configuration
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api-codilio.sbugarin.com/api',
  },
  
  // 🎯 Image optimization (optional)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-codilio.sbugarin.com',
      },
      {
        protocol: 'https',
        hostname: 'api-codilio2.sbugarin.com',
      },
    ],
  },
};

export default nextConfig;
