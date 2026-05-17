// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentCustomer, getCustomers, getRegisteredVehicles, getDocuments } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalVehicles: 0,
    totalDocuments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentCustomer();
        if (user.role !== 'admin') {
          router.push('/customer');
          return;
        }
        setAdmin(user);
        
        const [users, vehicles, documents] = await Promise.all([
          getCustomers(),
          getRegisteredVehicles({ limit: 1 }),
          getDocuments({ limit: 1 })
        ]);
        
        setStats({
          totalUsers: users.length,
          pendingUsers: users.filter(u => u.status === 'pending').length,
          totalVehicles: vehicles.pagination?.total || 0,
          totalDocuments: documents.pagination?.total || 0,
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const statCards = [
    { title: 'کل کاربران', value: stats.totalUsers, icon: 'fas fa-users', color: 'blue', href: '/admin/users' },
    { title: 'در انتظار تأیید', value: stats.pendingUsers, icon: 'fas fa-clock', color: 'yellow', href: '/admin/users?status=pending' },
    { title: 'کل موترها', value: stats.totalVehicles, icon: 'fas fa-car', color: 'green', href: '/admin/vehicles' },
    { title: 'کل اسناد', value: stats.totalDocuments, icon: 'fas fa-file-alt', color: 'purple', href: '/admin/documents' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a4a6a]">خوش آمدید، {admin?.name}</h1>
        <p className="text-gray-500 text-sm">به پنل مدیریت شرکت تجارتی عثمان عثمانی کاکر خوش آمدید</p>
      </div>

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            onClick={() => router.push(card.href)}
            className={`bg-white rounded-xl shadow-md p-5 border-r-4 border-${card.color}-500 cursor-pointer hover:shadow-lg transition`}
          >
            <div className="text-gray-500 text-sm">{card.title}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <i className={`${card.icon} text-${card.color}-500 text-2xl float-left mt-2`}></i>
          </div>
        ))}
      </div>

      {/* دسترسی سریع */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-[#1a4a6a] mb-4">دسترسی سریع</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admin/register-vehicle')}
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <i className="fas fa-plus-circle text-green-600 text-2xl"></i>
            <div className="text-right">
              <div className="font-semibold">ثبت موتر جدید</div>
              <div className="text-sm text-gray-500">ثبت موتر و اسناد گمرکی</div>
            </div>
          </button>
          
          <button
            onClick={() => router.push('/admin/documents/new')}
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <i className="fas fa-file-upload text-blue-600 text-2xl"></i>
            <div className="text-right">
              <div className="font-semibold">ثبت سند جدید</div>
              <div className="text-sm text-gray-500">افزودن سند گمرکی</div>
            </div>
          </button>
          
          <button
            onClick={() => router.push('/admin/calculator')}
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
          >
            <i className="fas fa-calculator text-purple-600 text-2xl"></i>
            <div className="text-right">
              <div className="font-semibold">محاسبه مالیات</div>
              <div className="text-sm text-gray-500">محاسبه مالیات گمرکی</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}