const path = require("path");

const nextConfig = {
  transpilePackages: ["@ecom/ui", "@ecom/utils", "@ecom/database"],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

module.exports = nextConfig;