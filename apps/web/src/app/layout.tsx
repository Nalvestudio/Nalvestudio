import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'nalv.estudio — Armá tus stickers y tu remera personalizada',
  description:
    'Subí tus diseños con su medida y armá tu propia plancha de stickers de 58 × 50 cm con las cantidades que quieras. Vinilo UV, impresión y corte en nalv.estudio.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
