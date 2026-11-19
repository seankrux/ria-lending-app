import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@react-pdf/renderer", "@react-pdf/layout", "yoga-layout"],
  turbopack: {
    root: __dirname,
    resolveAlias: { "yoga-layout/load": "./worker/yoga-loader.ts" },
  },
  webpack(config) {
    config.resolve.alias["yoga-layout/load"] = path.resolve(__dirname, "worker/yoga-loader.ts");
    return config;
  },
};

export default nextConfig;
