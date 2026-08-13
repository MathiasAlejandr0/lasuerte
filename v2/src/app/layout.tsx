import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactFab } from "@/components/layout/ContactFab";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { GoldenCloverEffect } from "@/components/ui/GoldenCloverEffect";
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

export const viewport: Viewport = {
  themeColor: "#06180b",
};

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
        <div aria-hidden="true" className="ambient-bg" />
        <div aria-hidden="true" className="noise-overlay" />
        <ScrollReveal />
        <SmoothScroll />
        <Suspense fallback={null}>
          <ReferralCapture />
        </Suspense>
        <DemoBanner />
        <Header />
        {children}
        <Footer />
        <ContactFab />
        <GoldenCloverEffect />
      </body>
    </html>
  );
}
