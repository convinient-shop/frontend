/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://backend-hj5j.onrender.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
