import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';

export const metadata: Metadata = {
  title: 'Fairview High School Engineering Club | FHS Knights',
  description:
    'Members portal for Fairview High School engineering competitions, subteams, workshops, and request center.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('fhs_theme') || 'system';
                const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 antialiased selection:bg-red-600 selection:text-white transition-colors duration-150">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
