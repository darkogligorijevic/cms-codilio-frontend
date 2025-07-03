import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Skip type checking during build - useful for CI/CD
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build  
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
