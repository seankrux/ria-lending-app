import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@react-pdf/renderer"],
  turbopack: {
    root: __dirname,
    resolveAlias: { "@react-pdf/renderer": "./worker/react-pdf.cjs" },
  },
  webpack(config) {
    config.resolve.alias["@react-pdf/renderer"] = path.resolve(__dirname, "worker/react-pdf.cjs");
    return config;
  },
};

export default nextConfig;
