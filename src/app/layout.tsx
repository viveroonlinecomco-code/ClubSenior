'use client';

import "./globals.css";
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Lazy load AuthProvider to avoid Supabase initialization at build time
const AuthProvider = dynamic(
  () => import("@/providers/auth-provider").then(mod => ({ default: mod.AuthProvider })),
  { loading: () => <>{}</> }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
