// app/[locale]/layout.tsx
import Sidebar from '@/components/Sidebar';
import '../globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = locale === 'fa' ? 'rtl' : 'ltr';
  
  return (
    <div className="flex h-screen bg-gray-100" dir={dir}>
      {/* محتوای اصلی - سمت چپ */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
      
      {/* سایدبار - سمت راست */}
      <Sidebar locale={locale} />
    </div>
  );
}