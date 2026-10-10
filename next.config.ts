import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid Node zlib Gzip drain MaxListenersExceededWarning under concurrent responses.
  compress: false,
  experimental: {
    serverActions: {
      // Canvas saves embed image data URLs in slide JSON; 1mb default is too low.
      bodySizeLimit: "10mb",
    },
  },
  // Keep ONNX runtime out of the Node server bundle (client-only ML).
  serverExternalPackages: ["@imgly/background-removal", "onnxruntime-web"],
};

export default nextConfig;
