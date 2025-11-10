/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove rewrites - frontend will call backend directly via NEXT_PUBLIC_API_BASE_URL
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;