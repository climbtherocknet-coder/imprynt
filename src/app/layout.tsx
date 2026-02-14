import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Instrument_Serif } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import '@/styles/theme.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Imprynt — Make Every Introduction Unforgettable',
  description: 'Tap your ring, share your page. NFC-powered networking with a public profile, typed portfolio, and a hidden personal layer. No cards, no app, no friction.',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/imprynt-logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'theme-color': '#0c1017',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('imprynt-theme') || 'system';
            var r = t === 'system'
              ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
              : t;
            document.documentElement.setAttribute('data-theme', r);
          })();
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0 }} className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
