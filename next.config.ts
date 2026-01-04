import type { NextConfig } from "next";

// Triggering redeploy for cache invalidation
const nextConfig = {
  transpilePackages: ["posthog-js", "lucide-react", "@supabase/ssr", "@supabase/supabase-js"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
