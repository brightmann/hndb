import { DirectoryConfig } from '@/types/content';
import { SEOConfig } from '@/lib/content/types';

export const directoryConfig: DirectoryConfig = {
  name: 'Starter Directory',
  description: 'A boilerplate for building content directories with Next.js',
  itemsPerPage: 9,
  features: {
    images: true,
    tags: true,
    search: true,
    pagination: true,
  },
  theme: {
    fontHeading: 'Cormorant_Garamond',
    fontBody: 'Nunito',
  },
};

export const seoConfig: SEOConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://starter-directory.example.com',
  siteName: directoryConfig.name,
  description: directoryConfig.description,
  twitterHandle: '@starterdirectory',
  socialLinks: [
    'https://github.com/your-username/your-repo',
    'https://twitter.com/starterdirectory',
  ],
  logo: '/logo.svg',
  defaultOgImage: '/og-default.png',
  defaultAuthor: 'Starter Directory Team',
  defaultKeywords: ['directory', 'boilerplate', 'nextjs', 'template', 'starter'],
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};
