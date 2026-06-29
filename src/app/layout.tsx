import type { Metadata } from "next";
import { Inter, Archivo_Black, Permanent_Marker, Caveat, Kalam } from 'next/font/google'
import "./globals.css";
import Navbar from "../components/layout/Navbar";


/* ========================================
   1. emplement next/font for optimization - self hosted
   ======================================== */

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
  display: 'swap',
})

const permanentMarker = Permanent_Marker({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-permanent-marker',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
  preload: false,
})

const kalam = Kalam({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-kalam',
  display: 'swap',
  preload: false,
})

const fontVariables = [
  inter.variable,
  archivoBlack.variable,
  permanentMarker.variable,
  caveat.variable,
  kalam.variable,
].join(' ')

/* ========================================
   2. initialize own App data
   ======================================== */
const siteUrl = 'https://hoxstudio.com'
const siteName = 'Hox Studio'
const siteTitle = 'Hox Studio | Portfolio'
const siteDescription = 'Kamel Mohamed (Hox) is a frontend engineer and AI engineer based in Cairo, Egypt. He specializes in React, Next.js, TypeScript, and Firebase, building motion-rich, accessible web experiences with AI integration. Open to freelance, remote, and full-time opportunities.'
const socialProfileLinks = [
  'https://github.com/Kamel-Codes',
  'https://www.linkedin.com/in/kamel-mohamed-526816305',
  'https://www.instagram.com/kamel_mo_hamed',
]

//Set App Meta data
export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    // Navigational - brand searches
    'HoxStudio',
    'HOXSTUDIO',
    'Kamel Mohamed',
    'Kamel Mohamed developer',
    'HOX STUDIO portfolio',
    'Kamel Mohamed portfolio',
    'hoxstudio.com',
    // Informational - "who is" / discovery
    'frontend engineer Egypt',
    'frontend engineer Cairo',
    'frontend developer Cairo',
    'AI engineer Egypt',
    'React developer Egypt',
    'Next.js developer Egypt',
    'TypeScript developer portfolio',
    'web developer El Mansoura',
    'software engineer Dakahlia',
    'frontend developer portfolio examples',
    'React portfolio website',
    // Commercial - hiring intent
    'hire React developer Egypt',
    'hire frontend developer Egypt',
    'freelance frontend developer Egypt',
    'freelance React developer remote',
    'frontend engineer for hire',
    'best frontend developer Egypt',
    // Transactional - direct engagement
    'contact frontend developer Egypt',
    'book frontend developer consultation',
    // Technical / skill-based
    'Firebase developer',
    'Framer Motion developer',
    'motion UI developer',
    'Tailwind CSS developer',
    'Next.js Firebase portfolio',
    'React TypeScript developer',
    'Electron developer Egypt',
  ],
  authors: [{ name: 'Kamel Mohamed', url: siteUrl }],
  creator: 'Kamel Mohamed',
  publisher: siteName,
  openGraph: {
    type: 'profile',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName,
    locale: 'en_US',
    images: [
      {
        url: '/icon-512.webp',
        width: 512,
        height: 512,
        alt: 'Hox Studio brand icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/favicon.webp'],
  },
  icons: {
    icon: [
      // SVG first: modern browsers use it as a crisp, scalable favicon.
      { url: '/favicon.webp', sizes: '600x600', type: 'image/webp' },

    ],
    apple: '/favicon.webp',
    shortcut: '/favicon.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` ${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        <div id="root">{children}</div>
        <Navbar />
      </body>
    </html>
  );
}
