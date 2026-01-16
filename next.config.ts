import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
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

export default withSentryConfig(nextConfig, {
  // Sentry organization and project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress source map upload logs
  silent: !process.env.CI,

  // Upload source maps for better error debugging
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Hides source maps from generated client bundles
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Tunnel sentry requests to avoid ad-blockers
  tunnelRoute: "/monitoring-tunnel",

  // Automatically instrument React components
  reactComponentAnnotation: {
    enabled: true,
  },
});
