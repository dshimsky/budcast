import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@budcast/shared"],
  outputFileTracingRoot: path.join(__dirname, "../..")
};

export default nextConfig;
