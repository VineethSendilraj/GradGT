import React from 'react';

export default function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'GradGT',
    'headline': 'Georgia Tech Course Planner',
    'description': 'An interactive tool to plan your Georgia Tech academic journey. Visualize course prerequisites, track requirements, and optimize your graduation path.',
    'url': 'https://gradgt.vercel.app',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'author': {
      '@type': 'Organization',
      'name': 'GradGT Team'
    },
    'audience': {
      '@type': 'Audience',
      'name': 'Georgia Tech Students'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 