import type { AppProps } from 'next/app';
import { Inter, Playfair_Display } from 'next/font/google';
import { useEffect } from 'react';
import '@/styles/globals.css';
import { initPerformanceOptimizations } from '@/lib/performance';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize performance optimizations
    initPerformanceOptimizations();
  }, []);

  return (
    <div className={`${inter.variable} ${playfair.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
