'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRegisteredVehicles, deleteRegisteredVehicle, getCurrentCustomer, type RegisteredVehicle } from '@/lib/api';

export default function VehicleListPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'fa';
  
  const [vehicles, setVehicles] = useState<RegisteredVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentCustomer();
        setCurrentUser(user);
        setIsAdmin(user.role === 'admin');
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const result = await getRegisteredVehicles({ search: search || undefined, limit: 100 });
      let filteredData = result.data || [];
      
      if (!isAdmin && currentUser) {
        filteredData = filteredData.filter(v => v.customer_id === currentUser._id);
      }
      
      setVehicles(filteredData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadVehicles();
    }
  }, [search, currentUser]);

  // ✅ اصلاح شده - مسیر درست
  const handleView = (chassis: string) => {
    if (isAdmin) {
      router.push(`/admin/vehicles/${encodeURIComponent(chassis)}`);
    } else {
      router.push(`/customer/vehicles/${encodeURIComponent(chassis)}`);
    }
  };

  const handleDelete = async (chassis: string) => {
    if (!isAdmin) {
      alert('شما مجوز حذف موتر را ندارید');
      return;
    }
    
    if (confirm('آیا از حذف این موتر و تمام اسناد آن اطمینان دارید؟')) {
      try {
        await deleteRegisteredVehicle(chassis);
        loadVehicles();
        alert('موتر با موفقیت حذف شد');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('خطا در حذف موتر');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a4a6a] mb-6">
        {isAdmin ? '📋 لیست موترهای ثبت شده' : '🚗 موترهای من'}
      </h1>

      {/* جستجو */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در شماره شاسی، برند یا مدل..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
          />
          <button
            onClick={() => loadVehicles()}
            className="bg-[#1a4a6a] text-white px-4 py-2 rounded-lg hover:bg-[#0b2b3b] transition"
          >
            <i className="fas fa-search"></i> جستجو
          </button>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <i className="fas fa-car text-5xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">هیچ موتری ثبت نشده است</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {vehicle.make_name} - {vehicle.model_name}
                  </h3>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>🔍 شماره شاسی: {vehicle.chassis_number}</p>
                    <p>📅 سال: {vehicle.year}</p>
                    <p>⚖️ وزن: {vehicle.weight} kg</p>
                    {vehicle.customer_name && <p>👤 مشتری: {vehicle.customer_name}</p>}
                  </div>
                </div>
                
                {/* ✅ دکمه‌ها - الان درست کار می‌کنند */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(vehicle.chassis_number)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
                  >
                    <i className="fas fa-eye"></i> مشاهده
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(vehicle.chassis_number)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-1"
                    >
                      <i className="fas fa-trash"></i> حذف
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}