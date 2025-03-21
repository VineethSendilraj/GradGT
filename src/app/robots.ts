import { MetadataRoute } from 'next'

// Add the required export for static generation
export const dynamic = 'force-static';
export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Disallow API routes if you have any
    },
    sitemap: 'https://gradgt.vercel.app/sitemap.xml',
  }
} 