/** @type {import('next').NextConfig} */
const nextConfig = {
<<<<<<< HEAD
  transpilePackages: ["@ecom/ui", "@ecom/utils", "@ecom/database"],

};
module.exports = nextConfig;
=======
  // ...jo bhi pehle se hai
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
>>>>>>> 41cfb7f71a6b465ea6ca924927b74cd04e21f4cc
