import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  transpilePackages: ['@react-pdf/renderer'],

  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
  }
};
export default nextConfig;