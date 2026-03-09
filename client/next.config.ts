import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force Turbopack to use the client folder as project root.
    root: process.cwd(),
  },
};

export default nextConfig;
