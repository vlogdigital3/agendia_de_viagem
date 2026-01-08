import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Using Next.js optimized font
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: "Maryfran Turismo - Painel de Controle",
  description: "Sistema de Gestão para Agência de Viagens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${montserrat.className} bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 antialiased transition-colors duration-300`} suppressHydrationWarning>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
