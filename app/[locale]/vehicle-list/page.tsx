'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRegisteredVehicles, deleteRegisteredVehicle, type RegisteredVehicle } from '@/lib/api';
import { getTranslation, type Locale } from '@/lib/translations';

export default function VehicleListPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || 'fa';
  const t = (key: string) => getTranslation(locale, key);
  
  const [vehicles, setVehicles] = useState<RegisteredVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const loadVehicles = async (page = 1) => {
    setLoading(true);
    try {
      const result = await getRegisteredVehicles({ search: search || undefined, limit: 20, page });
      setVehicles(result.data || []);
      setPagination(result.pagination || { page: 1, total: 0, pages: 1 });
    } catch (error) {
      console.error('Error loading vehicles:', error);
      alert('خطا در بارگذاری لیست موترها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles(1);
  }, [search]);

  const handleDelete = async (chassis: string) => {
    if (confirm('آیا از حذف این موتر و تمام اسناد آن اطمینان دارید؟')) {
      try {
        await deleteRegisteredVehicle(chassis);
        loadVehicles(pagination.page);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('خطا در حذف موتر');
      }
    }
  };

  const handleView = (chassis: string) => {
    router.push(`/${locale}/vehicle-list/${encodeURIComponent(chassis)}`);
  };

  const formatNumber = (num: number | undefined | null) => {
    if (!num && num !== 0) return '-';
    return num.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US');
    } catch {
      return '-';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1a4a6a] mb-8">{t('menuVehicleList')}</h1>
      
      {/* جستجو */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در شماره شاسی، پلیت، برند یا مدل..."
            className="input-field flex-1"
          />
          <button
            onClick={() => loadVehicles(1)}
            className="btn-primary px-6"
          >
            <i className="fas fa-search"></i> جستجو
          </button>
        </div>
      </div>
      
      {/* لیست موترها */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
          <p className="mt-2 text-gray-500">در حال بارگذاری...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <i className="fas fa-car-side text-5xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">هیچ موتری ثبت نشده است</p>
          <button
            onClick={() => router.push(`/${locale}/register-vehicle`)}
            className="mt-4 btn-primary"
          >
            <i className="fas fa-plus"></i> ثبت موتر جدید
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="card hover:shadow-lg transition">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-bold text-lg">
                        {vehicle.make_name || '-'} - {vehicle.model_name || '-'}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {vehicle.year || '-'}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">🔍 شماره شاسی:</span>{' '}
                        <span className="font-mono font-semibold">{vehicle.chassis_number || '-'}</span>
                      </div>
                      {vehicle.plate_number && (
                        <div>
                          <span className="text-gray-500">🚗 پلیت خارجی:</span>{' '}
                          <span className="font-semibold">{vehicle.plate_number}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">⚖️ وزن:</span>{' '}
                        <span>{formatNumber(vehicle.weight)} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">📦 کد HS:</span>{' '}
                        <span className="font-mono">{vehicle.code || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">📅 تاریخ ثبت:</span>{' '}
                        <span>{formatDate(vehicle.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fas fa-file-alt text-gray-400"></i>
                      <span className="text-gray-500">تعداد اسناد:</span>
                      <span className="font-semibold">{vehicle.document_count || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(vehicle.chassis_number)}
                      className="btn-secondary flex items-center gap-1"
                    >
                      <i className="fas fa-eye"></i> مشاهده
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.chassis_number)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-1"
                    >
                      <i className="fas fa-trash"></i> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => loadVehicles(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
              >
                ‹ قبلی
              </button>
              <span className="px-4 py-2">
                صفحه {pagination.page} از {pagination.pages}
              </span>
              <button
                onClick={() => loadVehicles(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
              >
                بعدی ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}