import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Alpex Housing Intelligence',
  description: 'Comprehensive housing affordability tracker with real-time data visualization',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-alpex-dark text-white min-h-screen">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
