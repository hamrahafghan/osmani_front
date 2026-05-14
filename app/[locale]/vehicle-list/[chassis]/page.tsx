'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRegisteredVehicleDetail, addDocumentToVehicle, type RegisteredVehicle, type VehicleDocument } from '@/lib/api';
import { getTranslation, type Locale } from '@/lib/translations';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || 'fa';
  const t = (key: string) => getTranslation(locale, key);
  const chassis = params?.chassis as string;
  
  const [vehicle, setVehicle] = useState<RegisteredVehicle | null>(null);
  const [documents, setDocuments] = useState<any>(null);
  const [allDocuments, setAllDocuments] = useState<VehicleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({
    document_type: 'custom',
    custom_type_name: '',
    image_url: '',
    text_content: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await getRegisteredVehicleDetail(decodeURIComponent(chassis));
        setVehicle(data.vehicle);
        setDocuments(data.documents);
        setAllDocuments(data.allDocuments);
      } catch (error) {
        console.error('Error loading vehicle detail:', error);
        alert('خطا در بارگذاری جزئیات موتر');
      } finally {
        setLoading(false);
      }
    };
    if (chassis) {
      loadDetail();
    }
  }, [chassis]);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.text_content.trim()) {
      alert('متن سند الزامی است');
      return;
    }
    
    setSubmitting(true);
    try {
      await addDocumentToVehicle(decodeURIComponent(chassis), {
        document_type: newDoc.document_type,
        custom_type_name: newDoc.document_type === 'custom' ? newDoc.custom_type_name : undefined,
        image_url: newDoc.image_url,
        text_content: newDoc.text_content
      });
      
      // بارگذاری مجدد جزئیات
      const data = await getRegisteredVehicleDetail(decodeURIComponent(chassis));
      setDocuments(data.documents);
      setAllDocuments(data.allDocuments);
      
      setShowAddDoc(false);
      setNewDoc({ document_type: 'custom', custom_type_name: '', image_url: '', text_content: '' });
      alert('سند با موفقیت اضافه شد');
    } catch (error: any) {
      console.error('Error adding document:', error);
      alert(error.message || 'خطا در افزودن سند');
    } finally {
      setSubmitting(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
        <p className="mt-2 text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">موتر یافت نشد</p>
        <button onClick={() => router.back()} className="mt-4 btn-secondary">
          بازگشت
        </button>
      </div>
    );
  }

  const docTypes = [
    { key: 'T1', title: 'سند T1', icon: 'fa-file-alt', color: 'blue' },
    { key: 'SSAID', title: 'سند SSAID', icon: 'fa-file-alt', color: 'green' },
    { key: 'عراده', title: 'سند عراده', icon: 'fa-file-alt', color: 'purple' },
    { key: 'مکتوب ای', title: 'سند مکتوب ای', icon: 'fa-file-alt', color: 'orange' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* دکمه بازگشت */}
      <button onClick={() => router.back()} className="mb-4 text-[#1a4a6a] hover:underline">
        <i className="fas fa-arrow-right ml-1"></i> بازگشت به لیست
      </button>
      
      {/* اطلاعات موتر */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#1a4a6a] mb-4">
          {vehicle.make_name} - {vehicle.model_name}
        </h1>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-barcode text-gray-400 w-6"></i>
              <span className="font-semibold">شماره شاسی:</span>
              <span className="font-mono">{vehicle.chassis_number}</span>
            </div>
            {vehicle.plate_number && (
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-car text-gray-400 w-6"></i>
                <span className="font-semibold">پلیت خارجی:</span>
                <span>{vehicle.plate_number}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-calendar text-gray-400 w-6"></i>
              <span className="font-semibold">سال تولید:</span>
              <span>{vehicle.year}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-weight-hanging text-gray-400 w-6"></i>
              <span className="font-semibold">وزن:</span>
              <span>{formatNumber(vehicle.weight)} kg</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-hashtag text-gray-400 w-6"></i>
              <span className="font-semibold">کد HS:</span>
              <span className="font-mono">{vehicle.code || '-'}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-tag text-gray-400 w-6"></i>
              <span className="font-semibold">کد TSC:</span>
              <span className="font-mono">{vehicle.tsc_code || '-'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* اسناد گمرکی */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1a4a6a]">📄 اسناد گمرکی</h2>
          <button
            onClick={() => setShowAddDoc(!showAddDoc)}
            className="btn-primary text-sm"
          >
            <i className="fas fa-plus"></i> افزودن سند جدید
          </button>
        </div>
        
        {/* فرم افزودن سند جدید */}
        {showAddDoc && (
          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="font-bold mb-3">➕ افزودن سند جدید</h3>
            <form onSubmit={handleAddDocument} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">نوع سند</label>
                <select
                  value={newDoc.document_type}
                  onChange={(e) => setNewDoc({ ...newDoc, document_type: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="T1">T1</option>
                  <option value="SSAID">SSAID</option>
                  <option value="عراده">عراده</option>
                  <option value="مکتوب ای">مکتوب ای</option>
                  <option value="custom">سند دلخواه</option>
                </select>
              </div>
              
              {newDoc.document_type === 'custom' && (
                <div>
                  <label className="block text-sm font-semibold mb-1">نام سند دلخواه</label>
                  <input
                    type="text"
                    value={newDoc.custom_type_name}
                    onChange={(e) => setNewDoc({ ...newDoc, custom_type_name: e.target.value })}
                    className="input-field text-sm"
                    placeholder="مثال: فاکتور خرید"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold mb-1">آدرس تصویر</label>
                <input
                  type="text"
                  value={newDoc.image_url}
                  onChange={(e) => setNewDoc({ ...newDoc, image_url: e.target.value })}
                  className="input-field text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">متن سند *</label>
                <textarea
                  value={newDoc.text_content}
                  onChange={(e) => setNewDoc({ ...newDoc, text_content: e.target.value })}
                  required
                  className="input-field text-sm"
                  rows={3}
                  placeholder="متن سند را وارد کنید..."
                />
              </div>
              
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="btn-primary text-sm">
                  {submitting ? 'در حال ثبت...' : 'ذخیره سند'}
                </button>
                <button type="button" onClick={() => setShowAddDoc(false)} className="btn-secondary text-sm">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* نمایش اسناد موجود */}
        <div className="space-y-4">
          {docTypes.map((docType) => {
            const doc = documents?.[docType.key];
            if (!doc) return null;
            return (
              <div key={docType.key} className={`border rounded-lg p-4 bg-${docType.color}-50`}>
                <h3 className={`font-bold text-lg mb-2 text-${docType.color}-700`}>
                  <i className={`fas ${docType.icon} ml-2`}></i>
                  {docType.title}
                </h3>
                {doc.image_url && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">تصویر:</span>
                    <a href={doc.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm ml-2">
                      {doc.image_url}
                    </a>
                  </div>
                )}
                <div className="mt-2">
                  <span className="text-sm text-gray-500">متن سند:</span>
                  <p className="text-gray-700 whitespace-pre-wrap mt-1 text-sm">{doc.text_content}</p>
                </div>
              </div>
            );
          })}
          
          {/* اسناد دلخواه */}
          {documents?.custom && documents.custom.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-bold text-lg mb-3 text-gray-700">
                <i className="fas fa-file-alt ml-2"></i>
                اسناد دلخواه
              </h3>
              {documents.custom.map((doc: any, idx: number) => (
                <div key={idx} className="border-t pt-3 mt-3 first:border-t-0 first:pt-0">
                  <h4 className="font-semibold">{doc.custom_type_name || 'سند دلخواه'}</h4>
                  {doc.image_url && (
                    <a href={doc.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">
                      {doc.image_url}
                    </a>
                  )}
                  <p className="text-gray-700 text-sm mt-1">{doc.text_content}</p>
                </div>
              ))}
            </div>
          )}
          
          {allDocuments.length === 0 && !showAddDoc && (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-file-alt text-4xl mb-2"></i>
              <p>هیچ سندی ثبت نشده است</p>
              <p className="text-sm">برای افزودن سند، روی دکمه "افزودن سند جدید" کلیک کنید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}