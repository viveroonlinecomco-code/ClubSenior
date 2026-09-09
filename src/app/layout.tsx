import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tardes de Café, Mente & Saberes",
  description: "Tranquilidad para el familiar + Actividad para el adulto mayor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
