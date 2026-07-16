import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin workspace root — multiple lockfiles exist above this dir.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
