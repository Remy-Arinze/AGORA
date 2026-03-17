import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/lib/store/StoreProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import * as Sentry from "@sentry/nextjs";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.agora-schools.com'),
  title: {
    default: 'Agora | Global Student Identity Ledger & School Management System',
    template: '%s | Agora'
  },
  description: 'Agora creates a borderless academic identity for every student, turning static paper trails into a living, portable digital profile secured by a global student ledger.',
  keywords: [
    'Digital Student Identity',
    'Global Student Ledger',
    'School Management System',
    'Digital Transcripts',
    'Academic Identity',
    'Verified Education Records',
    'EdTech Africa',
    'Student Data Portability',
    'Immutable Academic Records',
    'Blockchain Education Registry'
  ],
  authors: [{ name: 'Agora Team' }],
  creator: 'Agora',
  publisher: 'Agora',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.agora-schools.com',
    siteName: 'Agora',
    title: 'Agora - The Digital Chain-of-Trust for Education',
    description: 'A borderless academic identity for every student. Secured, portable, and immutable records on a global ledger.',
    images: [
      {
        url: '/assets/logos/agora_main.png',
        width: 1200,
        height: 630,
        alt: 'Agora - Digital Education Identity',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agora - Digital Education Identity',
    description: 'Transforming traditional transcripts into a lifelong asset. Verified, immutable, and instantly accessible student data.',
    images: ['/assets/logos/agora_main.png'],
  },
  icons: {
    icon: [
      { url: '/assets/favicon.ico' },
      { url: '/assets/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/apple-touch-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Initial Theme Script to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('agora-theme') === 'dark' || (!('agora-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else if (localStorage.getItem('agora-theme') === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  // Default to dark mode natively if preferred, otherwise dark
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Agora',
              url: 'https://www.agora-schools.com',
              logo: 'https://www.agora-schools.com/assets/logos/agora_main.png',
              description: 'Agora creates a borderless academic identity for every student, anchoring educational history in a global student ledger.',
              sameAs: [
                'https://twitter.com/agora_edu',
                'https://linkedin.com/company/agora-edu'
              ]
            })
          }}
        />
        {/* Service/Product Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: 'Agora Student Identity Ledger',
              provider: {
                '@type': 'Organization',
                name: 'Agora'
              },
              description: 'A unified management system that turns static paper trails into a living, portable digital profile for students.',
              areaServed: 'Global',
              serviceType: 'Education Management'
            })
          }}
        />
      </head>
      <body className={montserrat.className}>
        <ThemeProvider>
          <StoreProvider>
            <Sentry.ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center p-4 bg-[var(--dark-bg)] text-white text-center">
              <div>
                <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                <p className="opacity-70 mb-6">Our team has been notified. Please try refreshing the page.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-agora-blue rounded-lg hover:bg-agora-blue-dark transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>}>
              {children}
            </Sentry.ErrorBoundary>
            <Toaster position="top-right" />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
