import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Play Prêmios - Sistema de Sorteios",
  description: "Participe de sorteios incríveis e ganhe prêmios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
