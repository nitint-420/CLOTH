/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...jo bhi pehle se hai
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig