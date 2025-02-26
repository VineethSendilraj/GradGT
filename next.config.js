/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports
  output: 'export',
  // Disable image optimization since we're doing static export
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 