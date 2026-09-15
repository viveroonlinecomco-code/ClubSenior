import "./globals.css";
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth-guard';

// Lazy load providers to avoid Supabase initialization at build time
const AuthProvider = dynamic(
  () => import("@/providers/auth-provider").then(mod => ({ default: mod.AuthProvider })),
  { loading: () => <>{}</> }
);

const ThemeProvider = dynamic(
  () => import("@/providers/theme-provider").then(mod => ({ default: mod.ThemeProvider })),
  { loading: () => <>{}</> }
);

export const metadata = {
  title: 'Grupo Plateado - Tardes de Café, Mente & Saberes',
  description: 'Conectando generaciones, creando comunidad',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: [
    { media: '(prefers-color-scheme: light)', content: 'white' },
    { media: '(prefers-color-scheme: dark)', content: '#0f172a' }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
        <AuthGuard>
          <ThemeProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                {children}
              </div>
            </AuthProvider>
          </ThemeProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
