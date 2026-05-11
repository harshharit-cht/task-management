// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

};

export default nextConfig;