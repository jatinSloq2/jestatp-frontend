import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Groww spec: Inter, system-ui fallback stack, used everywhere —
// body copy, headings, and tabular figures alike.
const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'JestATP',
  description: 'Algorithmic trading, built on control.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${sans.variable} h-full font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}