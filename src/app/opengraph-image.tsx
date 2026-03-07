import { ImageResponse } from 'next/og'
import { directoryConfig } from '@/config/directory.config'

export const alt = directoryConfig.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#e2e8f0',
            marginBottom: '24px',
            display: 'flex',
          }}
        >
          {directoryConfig.name}
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '80%',
            display: 'flex',
          }}
        >
          {directoryConfig.description}
        </div>
      </div>
    ),
    { ...size }
  )
}
