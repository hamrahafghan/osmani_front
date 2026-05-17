// app/auth/layout.tsx
// این layout فقط برای صفحات احراز هویت (لاگین/ثبت‌نام) است
// بدون html تودرتو

import { Vazirmatn } from "next/font/google";
import "../globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // فقط children را برمی‌گردانیم (بدون html تودرتو)
  // html و body در app/layout.tsx ریشه وجود دارند
  return (
    <div className={vazirmatn.className}>
      {children}
    </div>
  );
}