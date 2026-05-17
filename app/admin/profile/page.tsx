// app/admin/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentCustomer } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const user = await getCurrentCustomer();
        if (user.role !== 'admin') {
          router.push('/customer');
          return;
        }
        setAdmin(user);
      } catch (error) {
        console.error('Error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    loadAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a4a6a]">👤 پروفایل ادمین</h1>
        <p className="text-gray-500 text-sm">مشاهده اطلاعات پروفایل</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#0b2b3b] to-[#1a4a6a] text-white p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-user-shield text-4xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">{admin?.name}</h2>
              <p className="opacity-80">مدیر سیستم</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-500">نام کامل</label>
              <p className="text-lg font-medium">{admin?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500">نام کاربری</label>
              <p className="text-lg font-medium">{admin?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500">نقش</label>
              <p className="text-lg font-medium">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">ادمین</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500">نوع حساب</label>
              <p className="text-lg font-medium">
                {admin?.customer_type === 'company' ? 'شرکت' : 'شخص حقیقی'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500">وضعیت</label>
              <p className="text-lg font-medium">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">فعال</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500">تاریخ عضویت</label>
              <p className="text-lg font-medium">
                {admin?.created_at ? new Date(admin.created_at).toLocaleDateString('fa-IR') : '-'}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <button
              onClick={() => router.push('/admin/settings')}
              className="bg-[#1a4a6a] text-white px-4 py-2 rounded-lg hover:bg-[#0b2b3b] transition"
            >
              <i className="fas fa-edit ml-1"></i>
              ویرایش پروفایل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}