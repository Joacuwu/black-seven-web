import type { NextConfig } from "next";

// Las fotos que se suben desde el panel de administración viven en Supabase Storage.
const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/products/**" }]
      : [],
  },
};

export default nextConfig;
