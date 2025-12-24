
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import GlobalClientEffects from "@/components/GlobalClientEffects";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIRCTT - 위치기반 AR 쿠폰 플랫폼",
  description: "위치기반 증강현실 디지털 재화를 이용한 차세대 광고 시스템. AR 피팅, 실시간 분석, 스마트 지갑까지.",
  keywords: ["AIRCTT", "쿠폰", "AR", "증강현실", "위치기반", "피팅", "매장", "사업자", "소비자", "디지털재화"],
  authors: [{ name: "AIRCTT" }],
  openGraph: {
    title: "AIRCTT - 위치기반 AR 쿠폰 플랫폼",
    description: "위치기반 증강현실 디지털 재화를 이용한 차세대 광고 시스템",
    type: "website",
    url: "https://airctt.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <>
      {children}
      <Toaster />
      <GlobalClientEffects />
    </>
  );

  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {content}
        </ThemeProvider>
      </body>
    </html>
  );
}
