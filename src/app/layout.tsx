import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Engineering Club Portal',
  description: 'Members-only portal for university engineering competitions, teams, workshops, funding, and work logs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
