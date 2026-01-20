import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['ssh2', 'node-ssh'],
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
