import type { Metadata } from "next";
import { Suspense } from "react";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReferralCapture } from "@/components/referral/ReferralCapture";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Suertudos Premios | Sorteo MOTORRAD CORSA R150 0km 2026",
  description:
    "Adquiere ilustraciones digitales del sur de Chile y participa del sorteo de la MOTORRAD CORSA R150 0km 2026. Pago seguro con Webpay y Mercado Pago.",
  icons: {
    icon: "/favicon/trebol.webp",
    apple: "/favicon/trebol.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${montserrat.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col font-sans antialiased bg-brand-bg text-brand-cream">
        <Suspense fallback={null}>
          <ReferralCapture />
        </Suspense>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
