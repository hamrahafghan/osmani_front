'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // تشخیص زبان فعلی از مسیر (فقط اولین بخش)
  const getCurrentLocale = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] === 'en') return 'en';
    return 'fa';
  };

  const currentLocale = getCurrentLocale();
  
  const switchLanguage = (locale: 'fa' | 'en') => {
    if (currentLocale === locale) return;
    
    // حذف بخش اول (زبان) از مسیر فعلی
    let pathWithoutLocale = pathname;
    
    if (currentLocale === 'en') {
      // حذف /en از ابتدا
      pathWithoutLocale = pathname.replace(/^\/en/, '') || '/';
    } else {
      // زبان فعلی فارسی است، نیازی به حذف نیست
      pathWithoutLocale = pathname;
    }
    
    // ساخت مسیر جدید
    let newPath: string;
    if (locale === 'fa') {
      newPath = pathWithoutLocale;
    } else {
      newPath = `/en${pathWithoutLocale}`;
    }
    
    // پاکسازی مسیر تودرتو احتمالی
    newPath = newPath.replace(/\/en\/en\//g, '/en/');
    newPath = newPath.replace(/\/fa\/fa\//g, '/fa/');
    newPath = newPath.replace(/\/(en|fa)\/(en|fa)/, '/$1');
    
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => switchLanguage('fa')}
        className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
          currentLocale === 'fa' 
            ? 'bg-[#2c5f2d] text-white' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        فارسی
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
          currentLocale === 'en' 
            ? 'bg-[#2c5f2d] text-white' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        English
      </button>
    </div>
  );
}