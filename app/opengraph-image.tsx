import { ImageResponse } from 'next/og'
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo'

export const alt = `${SITE_NAME} digital earning platform`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'radial-gradient(circle at 20% 20%, #4338ca 0, transparent 35%), radial-gradient(circle at 85% 75%, #7e22ce 0, transparent 35%), #020617',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: '72px 96px',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div style={{ color: '#a5b4fc', display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: 8, marginBottom: 24, textTransform: 'uppercase' }}>
          Digital earning • Community growth
        </div>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 900, lineHeight: 1.05 }}>
          {SITE_NAME}
        </div>
        <div style={{ color: '#cbd5e1', display: 'flex', fontSize: 30, lineHeight: 1.4, marginTop: 32, maxWidth: 920 }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size
  )
}
