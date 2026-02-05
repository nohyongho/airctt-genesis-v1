
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
  title: "AIRCTT - AI Reality CouponTalkTalk",
  description: "누구나 쉽게 쿠폰을 얻고 사용하는 차세대 디지털 쿠폰 플랫폼. 쿠폰 게임, 스마트 지갑, 가맹점 연동까지.",
  keywords: ["AIRCTT", "쿠폰톡톡", "CouponTalkTalk", "쿠폰", "할인", "가맹점", "소비자", "디지털쿠폰", "petctt", "구름장터"],
  authors: [{ name: "AIRCTT - (주)발로레" }],
  openGraph: {
    title: "AIRCTT - AI Reality CouponTalkTalk",
    description: "누구나 쉽게 쿠폰을 얻고 사용하는 차세대 디지털 쿠폰 플랫폼",
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
