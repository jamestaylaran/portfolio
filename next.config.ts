import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // postgres.js opens raw TCP/TLS sockets, so it must not be bundled.
  serverExternalPackages: ["postgres"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
