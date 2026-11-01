import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preview tunnels (cloudflared) are a different origin than localhost.
  allowedDevOrigins: ["127.0.0.1", "*.trycloudflare.com"],
  // Avoid Node zlib Gzip drain MaxListenersExceededWarning under concurrent responses.
  compress: false,
  experimental: {
    serverActions: {
      // Canvas saves embed image data URLs in slide JSON; 1mb default is too low.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
