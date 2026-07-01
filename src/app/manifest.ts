import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hox Studio',
    short_name: 'Hox Studio',
    description:
      'Portfolio of Kamel Mohamed(Hox Studio), a frontend and AI engineer based in Cairo, Egypt.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08090d',
    theme_color: '#08090d',
    icons: [
      {
        src: '/favicon.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: '/favicon.webp',
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
  }
}
