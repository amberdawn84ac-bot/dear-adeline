import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["posthog-js", "lucide-react", "@supabase/ssr", "@supabase/supabase-js"],
};

export default nextConfig;
