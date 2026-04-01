const nextConfig = {
  transpilePackages: ["@ecom/ui", "@ecom/utils", "@ecom/database"],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};
module.exports = nextConfig;
