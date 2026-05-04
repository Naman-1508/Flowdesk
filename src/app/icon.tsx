import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#080810',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6366f1',
          borderRadius: '6px',
          fontWeight: 800,
          border: '2px solid #22d3ee',
          fontFamily: 'sans-serif',
        }}
      >
        F
      </div>
    ),
    {
      ...size,
    }
  )
}
