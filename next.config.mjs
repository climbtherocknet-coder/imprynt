/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bcryptjs'],
  allowedDevOrigins: ['http://192.168.50.42', 'http://192.168.50.*'],
  devIndicators: false,
};

export default nextConfig;
