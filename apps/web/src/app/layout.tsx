import './globals.css';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { PHProvider, PostHogPageview } from '@/components/analytics/posthog';
import { PosthogIdentify } from '@/components/analytics/posthog';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from '@vercel/analytics/react';
import { AxiomWebVitals } from 'next-axiom';

import SessionProvider from '@/components/session-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Bonfire',
  description: 'Created by Starlight Labs',
  metadataBase: new URL(process.env.NEXT_PUBLIC_METADATA_BASE || ''),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Suspense>
        <PostHogPageview />
      </Suspense>
      <body className={inter.className}>
        <PHProvider>
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              {children}
              <Analytics />
              <AxiomWebVitals />
              <PosthogIdentify />
            </ThemeProvider>
          </SessionProvider>
        </PHProvider>
      </body>
    </html>
  );
}
