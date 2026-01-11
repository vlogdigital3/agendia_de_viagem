import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Using Next.js optimized font
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import Script from "next/script";

const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: "Maryfran Turismo | Agência de Viagens de Elite",
  description: "As melhores experiências de viagens e consultoria exclusiva Maryfran Turismo.",
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
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${montserrat.className} bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 antialiased transition-colors duration-300`} suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W73H2JR9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-W73H2JR9');`}
        </Script>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
