'use client';

import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";

// Note: metadata is only supported in Server Components
// export const metadata: Metadata = { ... }

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
