import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Using Next.js optimized font
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: "Maryfran Turismo | Agência de Viagens de Elite",
  description: "As melhores experiências de viagens e consultoria exclusiva Maryfran Turismo.",
  metadataBase: new URL('https://agendia-de-viagem.pages.dev'),
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Maryfran Turismo | Agência de Viagens",
    description: "As melhores experiências de viagens e pacotes exclusivos para você.",
    siteName: 'Maryfran Turismo',
    locale: 'pt_BR',
    type: 'website',
  },
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
