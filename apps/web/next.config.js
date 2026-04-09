/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ecom/ui", "@ecom/utils", "@ecom/database"],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;