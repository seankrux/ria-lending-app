import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Ensure the PDF fonts ship with the serverless function on Vercel
  outputFileTracingIncludes: {
    "/api/loans/[id]/agreement": ["./public/fonts/**"],
  },
  // Old brand domain permanently redirects to the new one
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "rialending.dgtechsolutions.online" }],
        destination: "https://dglending.dgtechsolutions.online/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
