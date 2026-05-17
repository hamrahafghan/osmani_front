// app/customer/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentCustomer, getRegisteredVehicles, getDocuments, type RegisteredVehicle, type VehicleDocument } from '@/lib/api';

// کامپوننت Pagination
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex justify-center items-center gap-2 mt-4 py-4" dir="ltr">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
      
      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded border hover:bg-gray-100 transition">1</button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded border transition ${
            currentPage === page 
              ? 'bg-[#1a4a6a] text-white' 
              : 'hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 rounded border hover:bg-gray-100 transition">{totalPages}</button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    </div>
  );
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [vehicles, setVehicles] = useState<RegisteredVehicle[]>([]);
  const [vehiclesTotal, setVehiclesTotal] = useState(0);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [documentsTotal, setDocumentsTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'documents'>('vehicles');
  
  // Stateهای مربوط به Pagination
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const [documentsPage, setDocumentsPage] = useState(1);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [searchDocument, setSearchDocument] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');
  
  const itemsPerPage = 20;

  // بارگذاری اطلاعات مشتری
  useEffect(() => {
    const loadCustomer = async () => {
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
        
        // بارگذاری موترها و اسناد بعد از دریافت اطلاعات مشتری
        await Promise.all([
          loadVehicles(1, user._id),
          loadDocuments(1, user._id)
        ]);
        
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [router]);

  // بارگذاری موترها با Pagination
  const loadVehicles = async (page: number, customerId?: string) => {
    setLoadingVehicles(true);
    try {
      const customerIdToUse = customerId || customer?._id;
      if (!customerIdToUse) return;
      
      const result = await getRegisteredVehicles({ 
        customer_id: customerIdToUse,
        page: page,
        limit: itemsPerPage
      });
      
      setVehicles(result.data);
      setVehiclesTotal(result.pagination?.total || result.data.length);
      setVehiclesPage(page);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // بارگذاری اسناد با Pagination
  const loadDocuments = async (page: number, customerId?: string) => {
    setLoadingDocuments(true);
    try {
      const customerIdToUse = customerId || customer?._id;
      if (!customerIdToUse) return;
      
      const result = await getDocuments({ 
        customer_id: customerIdToUse,
        page: page,
        limit: itemsPerPage
      });
      
      setDocuments(result.data);
      setDocumentsTotal(result.pagination?.total || result.data.length);
      setDocumentsPage(page);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // جستجو در موترها
  const handleSearchVehicle = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const result = await getRegisteredVehicles({ 
        customer_id: customer?._id,
        search: searchVehicle || undefined,
        page: 1,
        limit: itemsPerPage
      });
      setVehicles(result.data);
      setVehiclesTotal(result.pagination?.total || result.data.length);
      setVehiclesPage(1);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  }, [searchVehicle, customer?._id]);

  // جستجو در اسناد
  const handleSearchDocument = useCallback(async () => {
    setLoadingDocuments(true);
    try {
      const result = await getDocuments({ 
        customer_id: customer?._id,
        q: searchDocument || undefined,
        page: 1,
        limit: itemsPerPage
      });
      setDocuments(result.data);
      setDocumentsTotal(result.pagination?.total || result.data.length);
      setDocumentsPage(1);
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  }, [searchDocument, customer?._id]);

  // تغییر صفحه موترها
  const handleVehiclesPageChange = (page: number) => {
    loadVehicles(page);
  };

  // تغییر صفحه اسناد
  const handleDocumentsPageChange = (page: number) => {
    loadDocuments(page);
  };

  // تابع خروج - ریدایرکت به صفحه اصلی (/)
  const handleLogout = () => {
    // پاک کردن localStorage
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    
    // پاک کردن کوکی
    document.cookie = 'customer_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // ریدایرکت به صفحه اصلی (هوم)
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
      </div>
    );
  }

  const vehiclesTotalPages = Math.ceil(vehiclesTotal / itemsPerPage);
  const documentsTotalPages = Math.ceil(documentsTotal / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0b2b3b] to-[#1a4a6a] text-white shadow-lg sticky top-0 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-gavel text-2xl"></i>
            <div>
              <h1 className="text-xl font-bold">داشبورد مشتری</h1>
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
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
            >
              <i className="fas fa-sign-out-alt ml-1"></i> خروج
            </button>
          </div>
        </div>
      </header>

      {/* آمار */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div className="bg-white rounded-xl shadow-md p-5 border-r-4 border-blue-500">
          <div className="text-gray-500 text-sm">کل موترها</div>
          <div className="text-2xl font-bold">{vehiclesTotal}</div>
          <i className="fas fa-car text-blue-500 text-2xl float-left mt-2"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-r-4 border-green-500">
          <div className="text-gray-500 text-sm">کل اسناد</div>
          <div className="text-2xl font-bold">{documentsTotal}</div>
          <i className="fas fa-file-alt text-green-500 text-2xl float-left mt-2"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-r-4 border-purple-500">
          <div className="text-gray-500 text-sm">وضعیت حساب</div>
          <div className="text-2xl font-bold text-green-600">فعال</div>
          <i className="fas fa-check-circle text-purple-500 text-2xl float-left mt-2"></i>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="px-6">
        <div className="flex gap-2 border-b bg-white rounded-t-xl px-4">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'vehicles' 
                ? 'border-b-2 border-[#2c5f2d] text-[#2c5f2d]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-car ml-1"></i> موترهای من
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'documents' 
                ? 'border-b-2 border-[#2c5f2d] text-[#2c5f2d]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-file-alt ml-1"></i> اسناد من
          </button>
        </div>
      </div>

      {/* محتوای تب‌ها */}
      <div className="p-6">
        {/* تب موترها */}
        {activeTab === 'vehicles' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="جستجوی موتر (شماره شاسی، برند، مدل)..."
                  value={searchVehicle}
                  onChange={(e) => setSearchVehicle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchVehicle()}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
                <button
                  onClick={handleSearchVehicle}
                  className="bg-[#1a4a6a] text-white px-4 py-2 rounded-lg hover:bg-[#0b2b3b] transition"
                >
                  <i className="fas fa-search"></i> جستجو
                </button>
              </div>
            </div>
            
            {loadingVehicles ? (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
                <p className="mt-2 text-gray-500">در حال بارگذاری...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-car text-5xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">هیچ موتری ثبت نشده است</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-right">شماره شاسی</th>
                        <th className="p-3 text-right">برند</th>
                        <th className="p-3 text-right">مدل</th>
                        <th className="p-3 text-right">سال</th>
                        <th className="p-3 text-right">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle._id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">{vehicle.chassis_number}</td>
                          <td className="p-3">{vehicle.make_name}</td>
                          <td className="p-3">{vehicle.model_name}</td>
                          <td className="p-3">{vehicle.year}</td>
                          <td className="p-3">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">فعال</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {vehiclesTotalPages > 1 && (
                  <Pagination
                    currentPage={vehiclesPage}
                    totalPages={vehiclesTotalPages}
                    onPageChange={handleVehiclesPageChange}
                  />
                )}
                <div className="px-4 py-2 text-sm text-gray-500 border-t">
                  نمایش {((vehiclesPage - 1) * itemsPerPage) + 1} تا {Math.min(vehiclesPage * itemsPerPage, vehiclesTotal)} از {vehiclesTotal} موتر
                </div>
              </>
            )}
          </div>
        )}

        {/* تب اسناد */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="جستجوی اسناد (نوع سند، شماره شاسی، متن)..."
                  value={searchDocument}
                  onChange={(e) => setSearchDocument(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchDocument()}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
                <button
                  onClick={handleSearchDocument}
                  className="bg-[#1a4a6a] text-white px-4 py-2 rounded-lg hover:bg-[#0b2b3b] transition"
                >
                  <i className="fas fa-search"></i> جستجو
                </button>
              </div>
            </div>
            
            {loadingDocuments ? (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
                <p className="mt-2 text-gray-500">در حال بارگذاری...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-file-alt text-5xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">هیچ سندی یافت نشد</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-right">نوع سند</th>
                        <th className="p-3 text-right">شماره شاسی</th>
                        <th className="p-3 text-right">متن</th>
                        <th className="p-3 text-right">تاریخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {doc.document_type}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-sm">{doc.chassis_number}</td>
                          <td className="p-3 max-w-md truncate" title={doc.text_content}>
                            {doc.text_content}
                          </td>
                          <td className="p-3 text-sm">{new Date(doc.createdAt).toLocaleDateString('fa-IR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {documentsTotalPages > 1 && (
                  <Pagination
                    currentPage={documentsPage}
                    totalPages={documentsTotalPages}
                    onPageChange={handleDocumentsPageChange}
                  />
                )}
                <div className="px-4 py-2 text-sm text-gray-500 border-t">
                  نمایش {((documentsPage - 1) * itemsPerPage) + 1} تا {Math.min(documentsPage * itemsPerPage, documentsTotal)} از {documentsTotal} سند
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}