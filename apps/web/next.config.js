/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ecom/ui", "@ecom/utils", "@ecom/database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.vercel.app" },
    ],
  },
};

module.exports = nextConfig;