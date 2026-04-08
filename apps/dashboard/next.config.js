/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ecom/ui", "@ecom/utils", "@ecom/database"],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
