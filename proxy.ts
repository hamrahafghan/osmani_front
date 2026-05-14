// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['fa', 'en'];
const defaultLocale = 'fa';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // بررسی آیا مسیر دارای locale است
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) {
    // اگر مسیر درست است، ادامه بده
    return NextResponse.next();
  }
  
  // اگر مسیر بدون locale بود، به مسیر با locale پیش‌فرض هدایت کن
  const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // برای همه مسیرها به جز فایل‌های استاتیک و API
    '/((?!_next|_static|favicon.ico|api|.*\\..*).*)',
  ],
};