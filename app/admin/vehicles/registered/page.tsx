// app/admin/vehicles/registered/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRegisteredVehicles, deleteRegisteredVehicle, type RegisteredVehicle } from '@/lib/api';

export default function RegisteredVehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<RegisteredVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const result = await getRegisteredVehicles({ limit: 200 });
      setVehicles(result.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (chassisNumber: string) => {
    // رفتن به صفحه جزئیات موتر
    router.push(`/admin/vehicles/${chassisNumber}`);
  };

  const handleDelete = async (chassisNumber: string) => {
    if (confirm('آیا از حذف این موتر مطمئن هستید؟')) {
      try {
        await deleteRegisteredVehicle(chassisNumber);
        loadVehicles();
        alert('موتر با موفقیت حذف شد');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('خطا در حذف موتر');
      }
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.chassis_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-[#1a4a6a]">📋 لیست موترهای ثبت شده</h1>
        <p className="text-gray-500 text-sm">مشاهده و مدیریت موترهای ثبت شده در سیستم</p>
      </div>

      {/* جستجو */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="relative">
          <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
          <input
            type="text"
            placeholder="جستجو در شماره شاسی، برند، مدل یا نام مشتری..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
          />
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="text-gray-500 text-sm">کل موترها</div>
          <div className="text-2xl font-bold text-[#1a4a6a]">{vehicles.length}</div>
          <i className="fas fa-car text-blue-500 text-2xl float-left mt-2"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="text-gray-500 text-sm">موترهای این ماه</div>
          <div className="text-2xl font-bold text-[#1a4a6a]">
            {vehicles.filter(v => {
              const date = new Date(v.createdAt);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <i className="fas fa-calendar text-green-500 text-2xl float-left mt-2"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="text-gray-500 text-sm">آخرین بروزرسانی</div>
          <div className="text-sm font-semibold text-gray-600">
            {new Date().toLocaleDateString('fa-IR')}
          </div>
          <i className="fas fa-clock text-purple-500 text-2xl float-left mt-2"></i>
        </div>
      </div>

      {/* لیست موترها */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-car text-5xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">هیچ موتری ثبت نشده است</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-right">شماره شاسی</th>
                  <th className="p-3 text-right">برند</th>
                  <th className="p-3 text-right">مدل</th>
                  <th className="p-3 text-right">سال</th>
                  <th className="p-3 text-right">مشتری</th>
                  <th className="p-3 text-right">تاریخ ثبت</th>
                  <th className="p-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{vehicle.chassis_number}</td>
                    <td className="p-3">{vehicle.make_name}</td>
                    <td className="p-3">{vehicle.model_name}</td>
                    <td className="p-3">{vehicle.year}</td>
                    <td className="p-3">
                      <span className="text-sm">{vehicle.customer_name || '-'}</span>
                    </td>
                    <td className="p-3 text-sm">{new Date(vehicle.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(vehicle.chassis_number)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                        >
                          <i className="fas fa-eye"></i> مشاهده
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.chassis_number)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                        >
                          <i className="fas fa-trash"></i> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}