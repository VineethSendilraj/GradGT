/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minifier to avoid platform-specific issues
  swcMinify: false,
  // Enable static exports
  output: 'export',
  // Disable image optimization since we're doing static export
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 