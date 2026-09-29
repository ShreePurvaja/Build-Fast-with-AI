import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Workforce Platform - Indic Multi-Agent Builder & Visual Studio',
  description: 'Convert plain-language business needs into a generated team of narrow AI workers speaking Indian languages with MongoDB integration and n8n visual workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning={true}>
      <body className="bg-[#FAF8F5] text-[#2B2826] antialiased min-h-screen" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
