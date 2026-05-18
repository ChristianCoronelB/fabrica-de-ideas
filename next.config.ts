import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    ".space-z.ai",
  ],
  // Increase body size limit for file uploads (images, videos, attachments)
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
