import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Meteroid - Free Online Photo Editor',
  description: 'Meteroid is a powerful free online photo editor. Edit photos, apply effects, filters, add text, crop or resize pictures. Do Online Photo Editing in your browser for free!',
  keywords: 'photo editor, image editor, online editor, free editor, photopea alternative',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
