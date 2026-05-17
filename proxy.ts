// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// مسیرهای عمومی (بدون نیاز به لاگین)
const publicPaths = ['/auth/login', '/auth/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('customer_token')?.value;
  
  console.log('🔍 [Proxy] Path:', pathname, 'Token:', token ? 'Yes' : 'No');
  
  // مسیرهای API و فایل‌های استاتیک را نادیده بگیر
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.includes('favicon.ico') ||
      pathname.includes('.png') ||
      pathname.includes('.jpg') ||
      pathname.includes('.svg')) {
    return NextResponse.next();
  }
  
  // صفحه اصلی (/) - همیشه قابل دسترس (اجازه بده صفحه اصلی نمایش داده شود)
  if (pathname === '/' || pathname === '/fa' || pathname === '/en') {
    return NextResponse.next();
  }
  
  // بررسی مسیرهای عمومی
  const isPublic = publicPaths.some(path => {
    return pathname === path || pathname === `/fa${path}` || pathname === `/en${path}`;
  });
  
  // اگر مسیر عمومی است → اجازه دسترسی بده
  if (isPublic) {
    // اگر کاربر لاگین است و به صفحه لاگین می‌رود، به داشبورد هدایت شود
    if (token && (pathname.includes('/auth/login') || pathname.includes('/auth/register'))) {
      const dashboardUrl = new URL('/customer', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }
  
  // اگر توکن ندارد → برو به صفحه اصلی
  if (!token) {
    const homeUrl = new URL('/', request.url);
    console.log('🔄 Redirecting to:', homeUrl.pathname);
    return NextResponse.redirect(homeUrl);
  }
  
  // اگر توکن دارد و در مسیرهای محافظت شده است → ادامه بده
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};