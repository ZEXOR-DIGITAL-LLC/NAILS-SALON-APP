import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disables ESLint errors during `next build`.
    // Linting should be handled in CI or pre-commit hooks to keep builds green.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/mro-logix-app-images/**",
      },
    ],
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
    // Disabled optimizeCss due to lightningcss compatibility issues
    // optimizeCss: true,
  },
  // Modern browser support - reduces polyfills
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Enhanced Security Headers
  async headers() {
    return [
      // Stripe pages need relaxed COEP to allow embedded checkout
      {
        source: "/dashboard/manage-subscriptions",
        headers: [
          // Content Security Policy - With Stripe support
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "frame-src 'self' https://js.stripe.com https://*.stripe.com",
              "connect-src 'self' https://api.stripe.com https://*.supabase.co",
              "img-src 'self' data: blob: https://storage.googleapis.com https://*.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.stripe.com",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy - Enhanced
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://*.googletagmanager.com https://vercel.live https://js.stripe.com",
              "frame-src 'self' https://challenges.cloudflare.com https://vercel.live https://js.stripe.com https://*.stripe.com",
              "connect-src 'self' https://storage.googleapis.com https://challenges.cloudflare.com https://*.supabase.co https://*.r2.cloudflarestorage.com https://www.googletagmanager.com https://*.googletagmanager.com https://vercel.live https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://api.stripe.com",
              "img-src 'self' data: blob: https://storage.googleapis.com https://*.googleusercontent.com https://*.r2.cloudflarestorage.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Strict Transport Security
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // X-Frame-Options
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // X-Content-Type-Options
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // X-XSS-Protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy (payment enabled for Stripe)
          {
            key: "Permissions-Policy",
            value: [
              "geolocation=()",
              "microphone=()",
              "camera=()",
              "usb=()",
              "magnetometer=()",
              "gyroscope=()",
              "accelerometer=()",
            ].join(", "),
          },
          // X-Permitted-Cross-Domain-Policies
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          // Cache-Control for sensitive pages
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, private",
          },
        ],
      },
      // Additional security headers for API routes
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
          {
            key: "X-API-Version",
            value: "1.0",
          },
        ],
      },
    ];
  },
  // Bundle analyzer for debugging
  ...(process.env.ANALYZE === "true" && {
    webpack: (config: any) => {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: "bundle-analyzer.html",
          openAnalyzer: false,
        })
      );
      return config;
    },
  }),
};

export default nextConfig;
