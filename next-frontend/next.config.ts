import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly isolate Turbopack to this folder
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
