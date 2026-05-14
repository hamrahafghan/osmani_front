'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useState } from 'react';

interface SidebarProps {
  locale: string;
}

export default function Sidebar({ locale }: SidebarProps) {
  const pathname = usePathname();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  
  const getTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      fa: {
        menuSearch: '🔍 جستجو',
        menuBrowse: '🚗 محاسبه نرخ گمرک موتر',
        menuArchive: '📁 آرشیو',
        menuRegisterVehicle: '📝 ثبت اطلاعات گمرکی موتر',
        menuRegisteredVehicles: '📋 لیست موترهای ثبت شده',
        menuSettings: '⚙️ تنظیمات',
        appTitle: 'شرکت تجارتی عثمان عثمانی کاکر لمیتد',
        appSubtitle: 'سیستم محاسبه مالیات گمرکی',
      },
      en: {
        menuSearch: '🔍 Search',
        menuBrowse: '🚗 Calculate Vehicle Customs Rate',
        menuArchive: '📁 Archive',
        menuRegisterVehicle: '📝 Register Vehicle Customs Info',
        menuRegisteredVehicles: '📋 Registered Vehicles List',
        menuSettings: '⚙️ Settings',
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
    return isActive('/register-vehicle') || isActive('/vehicle-list');
  };

  // اگر آرشیو فعال باشد، آن را باز نگه دار
  if (isArchiveActive() && !isArchiveOpen) {
    setIsArchiveOpen(true);
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-[#0b2b3b] to-[#1a4a6a] text-white flex flex-col shadow-xl">
      {/* لوگو */}
      <div className="p-5 border-b border-white/20 text-center">
        <h1 className="text-lg font-bold">{getTranslation('appTitle')}</h1>
        <p className="text-xs opacity-70 mt-1">{getTranslation('appSubtitle')}</p>
      </div>

      {/* تغییر زبان */}
      <div className="p-3 border-b border-white/20 flex justify-center">
        <LanguageSwitcher />
      </div>

      {/* منو */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-2">
          {/* جستجو */}
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
          
          {/* محاسبه نرخ گمرک موتر */}
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
          
          {/* آرشیو (با زیرمجموعه) */}
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
                {/* ثبت اطلاعات گمرکی موتر */}
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
                
                {/* لیست موترهای ثبت شده */}
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
              </ul>
            )}
          </li>
          
          {/* تنظیمات */}
          <li>
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