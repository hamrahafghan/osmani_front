// app/customer/vehicles/[chassis]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRegisteredVehicleDetail, type RegisteredVehicle, type VehicleDocument } from '@/lib/api';

export default function CustomerVehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chassis = params?.chassis as string;

  const [vehicle, setVehicle] = useState<RegisteredVehicle | null>(null);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chassis) {
      loadVehicleDetail();
    }
  }, [chassis]);

  const loadVehicleDetail = async () => {
    try {
      const data = await getRegisteredVehicleDetail(decodeURIComponent(chassis));
      setVehicle(data.vehicle);
      setDocuments(data.allDocuments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-car text-5xl text-gray-300 mb-3"></i>
        <p className="text-gray-500">موتر یافت نشد</p>
        <button onClick={() => router.back()} className="mt-4 bg-[#1a4a6a] text-white px-4 py-2 rounded-lg">
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="mb-4 text-[#1a4a6a] hover:underline">
        <i className="fas fa-arrow-right ml-1"></i> بازگشت
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-[#1a4a6a] mb-4">
          {vehicle.make_name} - {vehicle.model_name}
        </h1>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>شماره شاسی:</strong> {vehicle.chassis_number}</p>
            <p><strong>سال تولید:</strong> {vehicle.year}</p>
            <p><strong>وزن:</strong> {vehicle.weight} kg</p>
            {vehicle.plate_number && <p><strong>پلیت خارجی:</strong> {vehicle.plate_number}</p>}
          </div>
          <div>
            <p><strong>کد HS:</strong> {vehicle.code || '-'}</p>
            <p><strong>کد TSC:</strong> {vehicle.tsc_code || '-'}</p>
            <p><strong>تاریخ ثبت:</strong> {new Date(vehicle.createdAt).toLocaleDateString('fa-IR')}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#1a4a6a] mb-4">📄 اسناد مرتبط</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500">هیچ سندی برای این موتر ثبت نشده است</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {doc.document_type}
                    </span>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{doc.text_content}</p>
                    {doc.image_url && (
                      <a 
                        href={doc.image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 text-sm mt-2 inline-block hover:underline"
                      >
                        <i className="fas fa-download ml-1"></i> دانلود فایل
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString('fa-IR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}