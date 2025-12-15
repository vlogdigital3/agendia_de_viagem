import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Next.js optimized font
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agência CRM - Painel de Controle",
  description: "Sistema de Gestão para Agência de Viagens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 antialiased transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}
