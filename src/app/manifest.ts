import { MetadataRoute } from 'next'

// Add the required export for static generation
export const dynamic = 'force-static';
export const revalidate = false;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GradGT - Georgia Tech Course Planner',
    short_name: 'GradGT',
    description: 'Interactive tool to plan your Georgia Tech academic journey',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#B3A369', // Georgia Tech gold
    icons: [
      {
        src: '/Georgia Tech Yellow Jackets Logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
} 