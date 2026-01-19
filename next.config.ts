import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

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
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withBundleAnalyzer(
  withSentryConfig(nextConfig, {
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
  })
);
