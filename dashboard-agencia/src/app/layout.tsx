import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Using Next.js optimized font
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: "Sua Agencia de Viagem",
  description: "aqui vc tem a melhor opção de pacotes de viagem para você e sua familia.",
  metadataBase: new URL('https://agendia-de-viagem.pages.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Sua Agencia de Viagem",
    description: "aqui vc tem a melhor opção de pacotes de viagem para você e sua familia.",
    url: 'https://agendia-de-viagem.pages.dev',
    siteName: 'Maryfran Turismo',
    images: [
      {
        url: '/favicon.png', // Using the logo for preview
        width: 800,
        height: 600,
        alt: 'Maryfran Turismo Logo',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
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
