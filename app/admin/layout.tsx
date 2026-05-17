// app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentCustomer } from '@/lib/api';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  subItems?: { name: string; href: string; icon: string }[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    'users', 'documents', 'settings'
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('customer_token');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        const user = await getCurrentCustomer();
        if (user.role !== 'admin') {
          router.push('/customer');
          return;
        }
        setAdmin(user);
      } catch (error) {
        console.error('Error:', error);
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    document.cookie = 'customer_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  // منوهای نهایی با تنظیمات
  const menuItems: MenuItem[] = [
    {
      name: 'داشبورد',
      href: '/admin',
      icon: 'fas fa-tachometer-alt',
    },
    {
      name: 'مدیریت کاربران',
      href: '/admin/users',
      icon: 'fas fa-users',
      subItems: [
        { name: 'لیست کاربران', href: '/admin/users', icon: 'fas fa-list' },
        { name: 'کاربران در انتظار', href: '/admin/users?status=pending', icon: 'fas fa-clock' },
        { name: 'کاربران فعال', href: '/admin/users?status=active', icon: 'fas fa-check-circle' },
      ],
    },
    {
      name: 'مدیریت اسناد',
      href: '/admin/documents',
      icon: 'fas fa-file-alt',
      subItems: [
        { name: 'آرشیو اسناد', href: '/admin/documents', icon: 'fas fa-archive' },
        { name: 'ثبت سند جدید', href: '/admin/documents/new', icon: 'fas fa-plus-circle' },
      ],
    },
    {
      name: 'محاسبه نرخ گمرکی',
      href: '/admin/calculate-tax',
      icon: 'fas fa-calculator',
    },
    {
      name: 'تنظیمات',
      href: '/admin/settings',
      icon: 'fas fa-cog',
      subItems: [
        { name: 'تنظیمات عمومی', href: '/admin/settings', icon: 'fas fa-wrench' },
        { name: 'پروفایل', href: '/admin/profile', icon: 'fas fa-user-circle' },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const isSubItemActive = (subItems?: { href: string }[]) => {
    if (!subItems) return false;
    return subItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* سایدبار */}
      <aside
        className={`fixed right-0 top-0 h-full bg-gradient-to-b from-[#0b2b3b] to-[#1a4a6a] text-white transition-all duration-300 z-30 shadow-2xl ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* لوگو و عنوان */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] rounded-lg flex items-center justify-center">
              <i className="fas fa-gavel text-xl"></i>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-sm">شرکت تجارتی</h1>
                <p className="text-xs opacity-70">عثمان عثمانی کاکر</p>
              </div>
            )}
          </div>
        </div>

        {/* اطلاعات ادمین */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-user-shield text-xl"></i>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{admin?.name}</p>
                <p className="text-xs opacity-70">مدیر سیستم</p>
              </div>
            )}
          </div>
        </div>

        {/* منو */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <div key={item.name} className="mb-1">
              {/* آیتم اصلی */}
              {item.subItems ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition group ${
                    isSubItemActive(item.subItems) ? 'bg-white/10 border-r-4 border-[#2c5f2d]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`${item.icon} w-5 text-center ${sidebarOpen ? '' : 'mx-auto'}`}></i>
                    {sidebarOpen && <span className="text-sm">{item.name}</span>}
                  </div>
                  {sidebarOpen && (
                    <i className={`fas fa-chevron-${expandedMenus.includes(item.name) ? 'up' : 'down'} text-xs transition-transform`}></i>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition group ${
                    isActive(item.href) ? 'bg-white/10 border-r-4 border-[#2c5f2d]' : ''
                  }`}
                >
                  <i className={`${item.icon} w-5 text-center ${sidebarOpen ? '' : 'mx-auto'}`}></i>
                  {sidebarOpen && <span className="text-sm">{item.name}</span>}
                </Link>
              )}

              {/* زیرمنو */}
              {item.subItems && expandedMenus.includes(item.name) && sidebarOpen && (
                <div className="bg-black/20 mr-8">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 transition ${
                        pathname === subItem.href ? 'bg-white/10 text-[#2c5f2d]' : 'text-gray-300'
                      }`}
                    >
                      <i className={`${subItem.icon} w-4 text-center`}></i>
                      <span>{subItem.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* دکمه خروج و جمع کردن سایدبار */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-2 rounded-lg hover:bg-white/10 transition"
          >
            <i className={`fas fa-chevron-${sidebarOpen ? 'right' : 'left'}`}></i>
            {sidebarOpen && <span className="text-sm">جمع کردن منو</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            <i className="fas fa-sign-out-alt"></i>
            {sidebarOpen && <span className="text-sm">خروج از سیستم</span>}
          </button>
        </div>
      </aside>

      {/* محتوای اصلی */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'mr-72' : 'mr-20'
        }`}
      >
        {/* هدر موبایل */}
        <div className="lg:hidden bg-gradient-to-r from-[#0b2b3b] to-[#1a4a6a] text-white p-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-2xl"
          >
            <i className="fas fa-bars"></i>
          </button>
          <h1 className="text-lg font-bold text-center -mt-6">پنل مدیریت</h1>
        </div>

        {/* محتوا */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* اوورلی برای موبایل */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}