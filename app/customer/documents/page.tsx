// app/customer/documents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDocuments, getCurrentCustomer, type VehicleDocument } from '@/lib/api';

export default function CustomerDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('customer_token');
        if (!token) {
          router.push('/');
          return;
        }

        const user = await getCurrentCustomer();
        if (user.role !== 'customer') {
          router.push('/admin');
          return;
        }
        setCustomer(user);
        
        await loadDocuments(user._id);
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const loadDocuments = async (customerId: string) => {
    try {
      // فقط اسناد مربوط به این مشتری
      const result = await getDocuments({ customer_id: customerId, limit: 200 });
      setDocuments(result.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const getDocumentTypeLabel = (type: string, customName?: string) => {
    if (type === 'custom') return customName || 'سند دلخواه';
    const types: Record<string, string> = {
      'clearance': 'بیانیه گمرکی',
      'invoice': 'فاکتور فروش',
      'transport': 'بارنامه',
      'insurance': 'بیمه نامه',
      'T1': 'T1',
      'SSAID': 'SSAID',
      'عراده': 'عراده',
      'مکتوب ای': 'مکتوب ای',
      'other': 'سایر'
    };
    return types[type] || type;
  };

  const getDocumentColor = (type: string) => {
    const colors: Record<string, string> = {
      'clearance': 'blue',
      'invoice': 'green',
      'transport': 'purple',
      'insurance': 'orange',
      'T1': 'indigo',
      'SSAID': 'teal',
      'عراده': 'pink',
      'مکتوب ای': 'yellow',
      'custom': 'gray'
    };
    return colors[type] || 'gray';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchSearch = !searchTerm || 
      doc.chassis_number.includes(searchTerm) ||
      doc.text_content.includes(searchTerm);
    const matchType = searchType === 'all' || doc.document_type === searchType;
    return matchSearch && matchType;
  });

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    document.cookie = 'customer_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0b2b3b] to-[#1a4a6a] text-white shadow-lg sticky top-0 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-gavel text-2xl"></i>
            <div>
              <h1 className="text-xl font-bold">اسناد من</h1>
              <p className="text-xs opacity-80">شرکت تجارتی عثمان عثمانی کاکر لمیتد</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <div className="text-sm font-semibold">{customer?.name}</div>
              <div className="text-xs opacity-70">
                {customer?.customer_type === 'company' ? 'شرکت' : 'شخص حقیقی'}
              </div>
            </div>
            <button
              onClick={() => router.push('/customer')}
              className="bg-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
            >
              <i className="fas fa-arrow-right ml-1"></i> بازگشت به داشبورد
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
            >
              <i className="fas fa-sign-out-alt ml-1"></i> خروج
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* فیلترها */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">جستجو</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجو در شماره شاسی یا متن اسناد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">نوع سند</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
              >
                <option value="all">همه انواع</option>
                <option value="clearance">بیانیه گمرکی</option>
                <option value="invoice">فاکتور فروش</option>
                <option value="transport">بارنامه</option>
                <option value="insurance">بیمه نامه</option>
                <option value="T1">T1</option>
                <option value="SSAID">SSAID</option>
                <option value="عراده">عراده</option>
                <option value="مکتوب ای">مکتوب ای</option>
                <option value="custom">سند دلخواه</option>
              </select>
            </div>
          </div>
        </div>

        {/* آمار */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="text-gray-500 text-sm">کل اسناد</div>
            <div className="text-2xl font-bold text-[#1a4a6a]">{filteredDocuments.length}</div>
            <i className="fas fa-file-alt text-blue-500 text-2xl float-left mt-2"></i>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="text-gray-500 text-sm">تعداد موترها</div>
            <div className="text-2xl font-bold text-[#1a4a6a]">
              {new Set(filteredDocuments.map(d => d.chassis_number)).size}
            </div>
            <i className="fas fa-car text-green-500 text-2xl float-left mt-2"></i>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="text-gray-500 text-sm">آخرین بروزرسانی</div>
            <div className="text-sm font-semibold text-gray-600">
              {new Date().toLocaleDateString('fa-IR')}
            </div>
            <i className="fas fa-calendar text-purple-500 text-2xl float-left mt-2"></i>
          </div>
        </div>

        {/* لیست اسناد */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-file-alt text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">هیچ سندی برای شما ثبت نشده است</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDocuments.map((doc) => {
                const color = getDocumentColor(doc.document_type);
                return (
                  <div key={doc._id} className={`p-6 hover:bg-gray-50 transition`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className={`bg-${color}-100 text-${color}-800 px-3 py-1 rounded-full text-sm font-semibold`}>
                            <i className="fas fa-file-alt ml-1"></i>
                            {getDocumentTypeLabel(doc.document_type, doc.custom_type_name)}
                          </span>
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-mono">
                            <i className="fas fa-barcode ml-1"></i>
                            شاسی: {doc.chassis_number}
                          </span>
                          <span className="text-gray-400 text-sm">
                            <i className="fas fa-calendar ml-1"></i>
                            {new Date(doc.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        
                        {doc.image_url && (
                          <a 
                            href={doc.image_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-500 text-sm mb-3 hover:underline"
                          >
                            <i className="fas fa-download"></i>
                            دانلود فایل ضمیمه
                          </a>
                        )}
                        
                        <div className="bg-gray-50 rounded-lg p-4 mt-2">
                          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                            {doc.text_content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}