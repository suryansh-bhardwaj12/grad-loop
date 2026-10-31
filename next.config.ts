import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler requires native SWC bindings; disable in WASM/fallback environment
  reactCompiler: false,
  typescript: {
    // Typecheck is verified separately with `tsc --noEmit`
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aetilcsnnwymnvshhmcb.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'tkbetqusqzqolaaujvwd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui.aceternity.com',
      },
    ],
  },
};

export default nextConfig;
