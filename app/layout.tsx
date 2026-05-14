// app/layout.tsx
import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "شرکت تجارتی عثمان عثمانی کاکر لمیتد | سیستم محاسبه مالیات گمرکی",
  description: "سیستم هوشمند محاسبات مالیات گمرکی افغانستان مبتنی بر ASYCUDA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa">
      <body className={vazirmatn.className}>{children}</body>
    </html>
  );
}