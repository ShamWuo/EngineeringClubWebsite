import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fairview High School Engineering Club | FHS Knights',
  description: 'Members portal for Fairview High School engineering competitions, subteams, workshops, and request center.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-black font-sans text-zinc-100">
        {children}
      </body>
    </html>
  );
}
