'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useState, useEffect } from 'react';

interface SidebarProps {
  locale: string;
}

export default function Sidebar({ locale }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const customerData = localStorage.getItem('customer_data');
    if (token && customerData) {
      setIsLoggedIn(true);
      const data = JSON.parse(customerData);
      setCustomerName(data.name);
      setRole(data.role);
    } else {
      setIsLoggedIn(false);
      setCustomerName('');
      setRole('');
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    document.cookie = 'customer_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsLoggedIn(false);
    setCustomerName('');
    setRole('');
    router.push(`/${locale}/login`);
  };

  const getTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      fa: {
        menuSearch: '🔍 جستجو',
        menuBrowse: '🚗 محاسبه نرخ گمرک موتر',
        menuArchive: '📁 آرشیو',
        menuRegisterVehicle: '📝 ثبت اطلاعات گمرکی موتر',
        menuRegisteredVehicles: '📋 لیست موترهای ثبت شده',
        menuDocuments: '📄 اسناد گمرکی',
        menuSettings: '⚙️ تنظیمات',
        menuCustomerDashboard: '📊 داشبورد',
        menuMyVehicles: '🚗 موترهای من',
        menuMyDocuments: '📄 اسناد من',
        menuAdminDashboard: '👑 مدیریت کاربران',
        menuCustomerLogin: '👤 ورود مشتریان',
        menuCustomerRegister: '📝 ثبت‌نام',
        menuLogout: '🚪 خروج',
        appTitle: 'شرکت تجارتی عثمان عثمانی کاکر لمیتد',
        appSubtitle: 'سیستم محاسبه مالیات گمرکی',
      },
      en: {
        menuSearch: '🔍 Search',
        menuBrowse: '🚗 Calculate Vehicle Customs Rate',
        menuArchive: '📁 Archive',
        menuRegisterVehicle: '📝 Register Vehicle Customs Info',
        menuRegisteredVehicles: '📋 Registered Vehicles List',
        menuDocuments: '📄 Customs Documents',
        menuSettings: '⚙️ Settings',
        menuCustomerDashboard: '📊 Dashboard',
        menuMyVehicles: '🚗 My Vehicles',
        menuMyDocuments: '📄 My Documents',
        menuAdminDashboard: '👑 User Management',
        menuCustomerLogin: '👤 Customer Login',
        menuCustomerRegister: '📝 Register',
        menuLogout: '🚪 Logout',
        appTitle: 'Osman Osmani Kakar Limited',
        appSubtitle: 'Customs Tax Calculation System',
      }
    };
    
    const lang = translations[locale] || translations.fa;
    return lang[key] || key;
  };
  
  const getLinkPath = (path: string) => {
    if (locale === 'fa') {
      return path;
    }
    return `/en${path}`;
  };

  const isActive = (path: string) => {
    const fullPath = getLinkPath(path);
    return pathname === fullPath || pathname === fullPath + '/';
  };

  const isArchiveActive = () => {
    return isActive('/register-vehicle') || isActive('/vehicle-list') || isActive('/documents');
  };

  if (isArchiveActive() && !isArchiveOpen) {
    setIsArchiveOpen(true);
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-[#0b2b3b] to-[#1a4a6a] text-white flex flex-col shadow-xl">
      <div className="p-5 border-b border-white/20 text-center">
        <h1 className="text-lg font-bold">{getTranslation('appTitle')}</h1>
        <p className="text-xs opacity-70 mt-1">{getTranslation('appSubtitle')}</p>
      </div>

      <div className="p-3 border-b border-white/20 flex justify-center">
        <LanguageSwitcher />
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-2">
          {/* صفحات عمومی */}
          <li>
            <Link
              href={getLinkPath('/search')}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                isActive('/search') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <i className="fas fa-search w-5 text-center"></i>
              <span>{getTranslation('menuSearch')}</span>
            </Link>
          </li>
          
          <li>
            <Link
              href={getLinkPath('/browse')}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                isActive('/browse') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <i className="fas fa-car w-5 text-center"></i>
              <span>{getTranslation('menuBrowse')}</span>
            </Link>
          </li>
          
          {/* آرشیو */}
          <li>
            <button
              onClick={() => setIsArchiveOpen(!isArchiveOpen)}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition ${
                isArchiveActive() ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-archive w-5 text-center"></i>
                <span>{getTranslation('menuArchive')}</span>
              </div>
              <i className={`fas fa-chevron-${isArchiveOpen ? 'down' : 'left'} text-xs transition-transform`}></i>
            </button>
            
            {isArchiveOpen && (
              <ul className="mr-6 mt-1 space-y-1 border-r border-white/20">
                {/* ثبت موتر - فقط ادمین */}
                {role === 'admin' && (
                  <li>
                    <Link
                      href={getLinkPath('/register-vehicle')}
                      className={`flex items-center gap-3 p-3 rounded-lg transition ${
                        isActive('/register-vehicle') ? 'bg-white/20' : 'hover:bg-white/10'
                      }`}
                    >
                      <i className="fas fa-file-signature w-5 text-center"></i>
                      <span className="text-sm">{getTranslation('menuRegisterVehicle')}</span>
                    </Link>
                  </li>
                )}
                
                {/* لیست موترها */}
                <li>
                  <Link
                    href={getLinkPath('/vehicle-list')}
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${
                      isActive('/vehicle-list') ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    <i className="fas fa-list-ul w-5 text-center"></i>
                    <span className="text-sm">{getTranslation('menuRegisteredVehicles')}</span>
                  </Link>
                </li>
                
                {/* اسناد */}
                <li>
                  <Link
                    href={getLinkPath('/documents')}
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${
                      isActive('/documents') ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    <i className="fas fa-file-alt w-5 text-center"></i>
                    <span className="text-sm">{getTranslation('menuDocuments')}</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* بخش مشتری (لاگین شده) */}
          {isLoggedIn && role === 'customer' && (
            <>
              <li className="border-t border-white/20 pt-2 mt-2">
                <div className="p-2 text-sm text-white/70">
                  <i className="fas fa-user-circle ml-1"></i>
                  {customerName}
                </div>
              </li>
              <li>
                <Link
                  href={getLinkPath('/customer/dashboard')}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    isActive('/customer/dashboard') ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <i className="fas fa-tachometer-alt w-5 text-center"></i>
                  <span>{getTranslation('menuCustomerDashboard')}</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition w-full text-red-300"
                >
                  <i className="fas fa-sign-out-alt w-5 text-center"></i>
                  <span>{getTranslation('menuLogout')}</span>
                </button>
              </li>
            </>
          )}
          
          {/* بخش ادمین (لاگین شده) */}
          {isLoggedIn && role === 'admin' && (
            <>
              <li className="border-t border-white/20 pt-2 mt-2">
                <div className="p-2 text-sm text-white/70">
                  <i className="fas fa-user-shield ml-1"></i>
                  {customerName} (ادمین)
                </div>
              </li>
              <li>
                <Link
                  href={getLinkPath('/admin/dashboard')}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    isActive('/admin/dashboard') ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <i className="fas fa-users-cog w-5 text-center"></i>
                  <span>{getTranslation('menuAdminDashboard')}</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition w-full text-red-300"
                >
                  <i className="fas fa-sign-out-alt w-5 text-center"></i>
                  <span>{getTranslation('menuLogout')}</span>
                </button>
              </li>
            </>
          )}
          
          {/* بخش ورود/ثبت‌نام (لاگین نشده) */}
          {!isLoggedIn && (
            <>
              <li className="border-t border-white/20 pt-2 mt-2">
                <div className="p-2 text-xs text-white/50 text-center">
                  حساب کاربری
                </div>
              </li>
              <li>
                <Link
                  href={getLinkPath('/login')}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    isActive('/login') ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <i className="fas fa-sign-in-alt w-5 text-center"></i>
                  <span>{getTranslation('menuCustomerLogin')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkPath('/register')}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    isActive('/register') ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <i className="fas fa-user-plus w-5 text-center"></i>
                  <span>{getTranslation('menuCustomerRegister')}</span>
                </Link>
              </li>
            </>
          )}
          
          {/* تنظیمات */}
          <li className="border-t border-white/20 pt-2 mt-2">
            <Link
              href={getLinkPath('/settings')}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                isActive('/settings') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <i className="fas fa-cog w-5 text-center"></i>
              <span>{getTranslation('menuSettings')}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}