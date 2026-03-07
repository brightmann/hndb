import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import path from 'path'

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  cacheComponents: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/src': path.join(process.cwd(), 'src'),
    }
    return config
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
