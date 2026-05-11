import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "اموال - سیستم محاسبه گمرک خودرو",
  description: "مشاهده و محاسبه عوارض گمرکی خودروهای سنگین",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-white">
          <Sidebar />
          <main className="flex-1 mr-72">{children}</main>
        </div>
      </body>
    </html>
  );
}