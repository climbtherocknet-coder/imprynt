/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['http://192.168.50.42', 'http://192.168.50.*'],
};

export default nextConfig;
