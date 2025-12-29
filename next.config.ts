import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // For user avatars
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // For seed data
      },
    ],
  },
};

export default nextConfig;
