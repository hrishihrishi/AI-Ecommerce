import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly isolate Turbopack to this folder
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
