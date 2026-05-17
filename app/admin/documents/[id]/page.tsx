// app/customer/documents/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDocument, type VehicleDocument } from '@/lib/api';

export default function CustomerDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [document, setDocument] = useState<VehicleDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  const loadDocument = async () => {
    try {
      const data = await getDocument(id);
      setDocument(data);
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

  if (!document) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-file-alt text-5xl text-gray-300 mb-3"></i>
        <p className="text-gray-500">سند یافت نشد</p>
        <button onClick={() => router.back()} className="mt-4 bg-[#1a4a6a] text-white px-4 py-2 rounded-lg">
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="mb-4 text-[#1a4a6a] hover:underline">
        <i className="fas fa-arrow-right ml-1"></i> بازگشت
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-[#1a4a6a]">جزئیات سند</h1>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {document.document_type}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-semibold text-gray-600">شماره شاسی:</label>
            <p className="font-mono">{document.chassis_number}</p>
          </div>
          
          <div>
            <label className="font-semibold text-gray-600">متن سند:</label>
            <div className="bg-gray-50 p-4 rounded-lg mt-1 whitespace-pre-wrap">
              {document.text_content}
            </div>
          </div>
          
          {document.image_url && (
            <div>
              <label className="font-semibold text-gray-600">فایل ضمیمه:</label>
              <div className="mt-1">
                <a 
                  href={document.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-2"
                >
                  <i className="fas fa-download"></i> دانلود فایل
                </a>
              </div>
            </div>
          )}
          
          <div>
            <label className="font-semibold text-gray-600">تاریخ ثبت:</label>
            <p>{new Date(document.createdAt).toLocaleDateString('fa-IR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}