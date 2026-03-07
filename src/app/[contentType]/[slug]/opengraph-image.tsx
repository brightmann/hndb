import { ImageResponse } from 'next/og'
import { getContentBySlug, getAllContentSlugs } from '@/lib/content'

export const alt = 'Article cover'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  return getAllContentSlugs()
}

export default async function Image({
  params,
}: {
  params: Promise<{ contentType: string; slug: string }>
}) {
  const { contentType: type, slug } = await params
  const item = await getContentBySlug(type, slug)

  if (!item) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: '#1a1a2e',
            color: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Not Found
        </div>
      ),
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          background:
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: '#a8b2d1',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '16px',
            display: 'flex',
          }}
        >
          {type}
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 'bold',
            color: '#e2e8f0',
            lineHeight: 1.2,
            marginBottom: '24px',
            display: 'flex',
          }}
        >
          {item.meta.title}
        </div>
        {item.meta.summary && (
          <div
            style={{
              fontSize: 24,
              color: '#94a3b8',
              lineHeight: 1.4,
              display: 'flex',
              maxWidth: '80%',
            }}
          >
            {item.meta.summary.slice(0, 120)}
            {item.meta.summary.length > 120 ? '...' : ''}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '32px',
            fontSize: 18,
            color: '#64748b',
          }}
        >
          {item.meta.author && (
            <span style={{ display: 'flex' }}>{item.meta.author}</span>
          )}
          {item.meta.date && (
            <span style={{ display: 'flex' }}>{item.meta.date}</span>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
