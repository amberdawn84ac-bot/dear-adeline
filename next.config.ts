import type { NextConfig } from "next";

// Triggering redeploy for cache invalidation
const nextConfig: NextConfig = {
  transpilePackages: ["posthog-js", "lucide-react", "@supabase/ssr", "@supabase/supabase-js"],
};

export default nextConfig;
