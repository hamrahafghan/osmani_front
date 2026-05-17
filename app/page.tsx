// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // بررسی توکن و ریدایرکت مناسب
    const token = localStorage.getItem('customer_token');
    if (token) {
      // بررسی نقش کاربر
      const userData = localStorage.getItem('customer_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/customer');
          }
          return;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      router.push('/customer');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b2b3b] to-[#1a4a6a]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-white"></i>
          <p className="text-white mt-4">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b2b3b] to-[#1a4a6a]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-gavel text-4xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">شرکت تجارتی عثمان عثمانی کاکر لمیتد</h1>
          <p className="text-xl opacity-90 mb-8">سیستم محاسبه مالیات گمرکی</p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/auth/login"
              className="bg-white text-[#1a4a6a] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
            >
              ورود به سامانه
            </a>
            <a
              href="/auth/register"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#1a4a6a] transition inline-block"
            >
              ثبت‌نام
            </a>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
            <i className="fas fa-car text-3xl mb-3"></i>
            <h3 className="text-xl font-bold mb-2">محاسبه مالیات</h3>
            <p className="opacity-80">محاسبه خودکار مالیات گمرکی موترها</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
            <i className="fas fa-file-alt text-3xl mb-3"></i>
            <h3 className="text-xl font-bold mb-2">مدیریت اسناد</h3>
            <p className="opacity-80">ثبت و مدیریت اسناد گمرکی</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
            <i className="fas fa-chart-line text-3xl mb-3"></i>
            <h3 className="text-xl font-bold mb-2">گزارشات</h3>
            <p className="opacity-80">مشاهده گزارشات مالی و گمرکی</p>
          </div>
        </div>
      </div>
    </div>
  );
}