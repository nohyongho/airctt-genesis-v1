import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIRCTT Hub - AI Reality CouponTalkTalk",
  description: "쿠폰 게임, 지갑, 구름장터를 한 곳에서! AIRCTT 통합 허브",
  keywords: ["AIRCTT", "쿠폰톡톡", "게임", "지갑", "구름장터", "쿠폰"],
};

export default function AircttLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
