'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMakes, getModelsByMake, getAvailableYears, getVehicleFullInfo, registerVehicle } from '@/lib/api';
import { getTranslation, type Locale } from '@/lib/translations';

export default function RegisterVehiclePage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'fa';
  const t = (key: string) => getTranslation(locale, key);
  
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  
  // اطلاعات انتخاب شده
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState(0);
  const [vehicleWeight, setVehicleWeight] = useState(0);
  const [hsCode, setHsCode] = useState('');
  const [tscCode, setTscCode] = useState('');
  
  // اطلاعات فرم
  const [formData, setFormData] = useState({
    chassis_number: '',
    plate_number: '',
    documents: {
      T1: { image_file: null as File | null, image_preview: '', text_content: '' },
      SSAID: { image_file: null as File | null, image_preview: '', text_content: '' },
      عراده: { image_file: null as File | null, image_preview: '', text_content: '' },
      مکتوب_ای: { image_file: null as File | null, image_preview: '', text_content: '' },
    },
    custom_documents: [] as { name: string; image_file: File | null; image_preview: string; text_content: string }[]
  });
  
  const [customDocName, setCustomDocName] = useState('');

  // بارگذاری برندها
  useEffect(() => {
    const loadMakes = async () => {
      try {
        const data = await getMakes();
        setMakes(data);
      } catch (error) {
        console.error('Error loading makes:', error);
      }
    };
    loadMakes();
  }, []);

  // بارگذاری مدل‌ها هنگام تغییر برند
  const handleMakeChange = async (make: string) => {
    setSelectedMake(make);
    setSelectedModel('');
    setSelectedYear(0);
    setModels([]);
    setYears([]);
    setVehicleWeight(0);
    setHsCode('');
    setTscCode('');
    
    if (make) {
      try {
        const data = await getModelsByMake(make);
        setModels(data);
      } catch (error) {
        console.error('Error loading models:', error);
        setModels([]);
      }
    }
  };

  // بارگذاری سال‌ها هنگام تغییر مدل
  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    setSelectedYear(0);
    setYears([]);
    setVehicleWeight(0);
    setHsCode('');
    setTscCode('');
    
    if (selectedMake && model) {
      try {
        const yearsList = await getAvailableYears(selectedMake, model);
        setYears(yearsList);
        if (yearsList.length > 0) {
          const firstYear = yearsList[0];
          setSelectedYear(firstYear);
          const vehicle = await getVehicleFullInfo(selectedMake, model, firstYear);
          if (vehicle) {
            setVehicleWeight(vehicle.weight || 0);
            setHsCode(vehicle.code || '');
            setTscCode(vehicle.tsc_code || '');
          }
        }
      } catch (error) {
        console.error('Error loading years:', error);
      }
    }
  };

  // بارگذاری اطلاعات موتر هنگام تغییر سال
  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    
    if (selectedMake && selectedModel && year) {
      const vehicle = await getVehicleFullInfo(selectedMake, selectedModel, year);
      if (vehicle) {
        setVehicleWeight(vehicle.weight || 0);
        setHsCode(vehicle.code || '');
        setTscCode(vehicle.tsc_code || '');
      }
    }
  };

  // تبدیل فایل به Base64 برای ذخیره موقت
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // آپلود فایل برای اسناد اصلی
  const handleDocumentImageChange = async (docType: string, file: File | null) => {
    if (file) {
      const preview = await fileToBase64(file);
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [docType]: { ...formData.documents[docType as keyof typeof formData.documents], image_file: file, image_preview: preview }
        }
      });
    } else {
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [docType]: { ...formData.documents[docType as keyof typeof formData.documents], image_file: null, image_preview: '' }
        }
      });
    }
  };

  const handleDocumentTextChange = (docType: string, value: string) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [docType]: { ...formData.documents[docType as keyof typeof formData.documents], text_content: value }
      }
    });
  };

  // اسناد دلخواه
  const addCustomDocument = () => {
    if (customDocName.trim()) {
      setFormData({
        ...formData,
        custom_documents: [...formData.custom_documents, { 
          name: customDocName, 
          image_file: null, 
          image_preview: '', 
          text_content: '' 
        }]
      });
      setCustomDocName('');
    }
  };

  const removeCustomDocument = (index: number) => {
    const newCustomDocs = [...formData.custom_documents];
    newCustomDocs.splice(index, 1);
    setFormData({ ...formData, custom_documents: newCustomDocs });
  };

  const handleCustomImageChange = async (index: number, file: File | null) => {
    if (file) {
      const preview = await fileToBase64(file);
      const newCustomDocs = [...formData.custom_documents];
      newCustomDocs[index] = { ...newCustomDocs[index], image_file: file, image_preview: preview };
      setFormData({ ...formData, custom_documents: newCustomDocs });
    }
  };

  const handleCustomTextChange = (index: number, value: string) => {
    const newCustomDocs = [...formData.custom_documents];
    newCustomDocs[index] = { ...newCustomDocs[index], text_content: value };
    setFormData({ ...formData, custom_documents: newCustomDocs });
  };

  // آپلود واقعی فایل به سرور (بعداً با API)
  const uploadFile = async (file: File): Promise<string> => {
    // اینجا باید فایل را به سرور آپلود کنید و آدرس برگشتی را دریافت کنید
    // فعلاً یک آدرس موقت برمی‌گردانیم
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.chassis_number) {
      alert('شماره شاسی الزامی است');
      return;
    }
    
    if (!selectedMake || !selectedModel || !selectedYear) {
      alert('لطفاً برند، مدل و سال تولید را انتخاب کنید');
      return;
    }
    
    setLoading(true);
    
    try {
      // آماده سازی اسناد برای ارسال
      const documents = [];
      
      // افزودن ۴ سند اصلی
      const docTypes = ['T1', 'SSAID', 'عراده', 'مکتوب_ای'];
      for (const docType of docTypes) {
        const doc = formData.documents[docType as keyof typeof formData.documents];
        let imageUrl = '';
        
        if (doc.image_file) {
          imageUrl = await uploadFile(doc.image_file);
        }
        
        if (doc.text_content.trim()) {
          documents.push({
            type: docType === 'مکتوب_ای' ? 'مکتوب ای' : docType,
            image_url: imageUrl,
            text_content: doc.text_content
          });
        }
      }
      
      // افزودن اسناد دلخواه
      for (const customDoc of formData.custom_documents) {
        let imageUrl = '';
        if (customDoc.image_file) {
          imageUrl = await uploadFile(customDoc.image_file);
        }
        
        if (customDoc.text_content.trim()) {
          documents.push({
            type: 'custom',
            custom_name: customDoc.name,
            image_url: imageUrl,
            text_content: customDoc.text_content
          });
        }
      }
      
      await registerVehicle({
        chassis_number: formData.chassis_number,
        plate_number: formData.plate_number,
        make_name: selectedMake,
        model_name: selectedModel,
        year: selectedYear,
        weight: vehicleWeight,
        hs_code: hsCode,
        tsc_code: tscCode,
        documents
      });
      
      alert('موتر و اسناد با موفقیت ثبت شد');
      
      // پاک کردن فرم
      setFormData({
        chassis_number: '',
        plate_number: '',
        documents: {
          T1: { image_file: null, image_preview: '', text_content: '' },
          SSAID: { image_file: null, image_preview: '', text_content: '' },
          عراده: { image_file: null, image_preview: '', text_content: '' },
          مکتوب_ای: { image_file: null, image_preview: '', text_content: '' },
        },
        custom_documents: []
      });
      setSelectedMake('');
      setSelectedModel('');
      setSelectedYear(0);
      setModels([]);
      setYears([]);
      setVehicleWeight(0);
      setHsCode('');
      setTscCode('');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'خطا در ثبت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1a4a6a] mb-8">{t('menuRegisterVehicle')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* مشخصات موتر */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-[#1a4a6a] border-r-4 border-[#2c5f2d] pr-3">
            📋 مشخصات کامل موتر
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">شماره شاسی *</label>
              <input
                type="text"
                value={formData.chassis_number}
                onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
                required
                className="input-field font-mono"
                placeholder="مثال: JHMGD18503S123456"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">شماره پلیت خارجی</label>
              <input
                type="text"
                value={formData.plate_number}
                onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                className="input-field"
                placeholder="مثال: ABC-1234"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">برند *</label>
              <select
                value={selectedMake}
                onChange={(e) => handleMakeChange(e.target.value)}
                required
                className="input-field"
              >
                <option value="">انتخاب برند</option>
                {makes.map((make) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">مدل *</label>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                required
                disabled={!selectedMake}
                className="input-field"
              >
                <option value="">انتخاب مدل</option>
                {models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">سال تولید *</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                required
                disabled={years.length === 0}
                className="input-field"
              >
                <option value="">انتخاب سال</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">وزن (کیلوگرم)</label>
              <input
                type="text"
                value={vehicleWeight ? formatNumber(vehicleWeight) : ''}
                readOnly
                className="input-field bg-gray-100"
                placeholder="خودکار از دیتابیس"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">کد HS</label>
              <input
                type="text"
                value={hsCode}
                readOnly
                className="input-field bg-gray-100 font-mono"
                placeholder="خودکار از دیتابیس"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">کد TSC</label>
              <input
                type="text"
                value={tscCode}
                readOnly
                className="input-field bg-gray-100 font-mono"
                placeholder="خودکار از دیتابیس"
              />
            </div>
          </div>
        </div>
        
        {/* اسناد گمرکی */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-[#1a4a6a] border-r-4 border-[#2c5f2d] pr-3">
            📄 اسناد گمرکی (حداقل ۴ سند)
          </h2>
          
          {/* سند T1 */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-3 text-blue-700">📄 سند T1</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">تصویر سند</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleDocumentImageChange('T1', e.target.files?.[0] || null)}
                  className="input-field text-sm py-2"
                />
                {formData.documents.T1.image_preview && (
                  <div className="mt-2">
                    <img src={formData.documents.T1.image_preview} alt="پیش‌نمایش" className="w-32 h-32 object-cover rounded border" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">متن سند</label>
                <textarea
                  value={formData.documents.T1.text_content}
                  onChange={(e) => handleDocumentTextChange('T1', e.target.value)}
                  className="input-field text-sm"
                  rows={3}
                  placeholder="متن سند T1 را وارد کنید..."
                />
              </div>
            </div>
          </div>
          
          {/* سند SSAID */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-3 text-green-700">📄 سند SSAID</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">تصویر سند</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleDocumentImageChange('SSAID', e.target.files?.[0] || null)}
                  className="input-field text-sm py-2"
                />
                {formData.documents.SSAID.image_preview && (
                  <div className="mt-2">
                    <img src={formData.documents.SSAID.image_preview} alt="پیش‌نمایش" className="w-32 h-32 object-cover rounded border" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">متن سند</label>
                <textarea
                  value={formData.documents.SSAID.text_content}
                  onChange={(e) => handleDocumentTextChange('SSAID', e.target.value)}
                  className="input-field text-sm"
                  rows={3}
                  placeholder="متن سند SSAID را وارد کنید..."
                />
              </div>
            </div>
          </div>
          
          {/* سند عراده */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-3 text-purple-700">📄 سند عراده</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">تصویر سند</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleDocumentImageChange('عراده', e.target.files?.[0] || null)}
                  className="input-field text-sm py-2"
                />
                {formData.documents.عراده.image_preview && (
                  <div className="mt-2">
                    <img src={formData.documents.عراده.image_preview} alt="پیش‌نمایش" className="w-32 h-32 object-cover rounded border" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">متن سند</label>
                <textarea
                  value={formData.documents.عراده.text_content}
                  onChange={(e) => handleDocumentTextChange('عراده', e.target.value)}
                  className="input-field text-sm"
                  rows={3}
                  placeholder="متن سند عراده را وارد کنید..."
                />
              </div>
            </div>
          </div>
          
          {/* سند مکتوب ای */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-3 text-orange-700">📄 سند مکتوب ای</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">تصویر سند</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleDocumentImageChange('مکتوب_ای', e.target.files?.[0] || null)}
                  className="input-field text-sm py-2"
                />
                {formData.documents.مکتوب_ای.image_preview && (
                  <div className="mt-2">
                    <img src={formData.documents.مکتوب_ای.image_preview} alt="پیش‌نمایش" className="w-32 h-32 object-cover rounded border" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">متن سند</label>
                <textarea
                  value={formData.documents.مکتوب_ای.text_content}
                  onChange={(e) => handleDocumentTextChange('مکتوب_ای', e.target.value)}
                  className="input-field text-sm"
                  rows={3}
                  placeholder="متن سند مکتوب ای را وارد کنید..."
                />
              </div>
            </div>
          </div>
          
          {/* اسناد دلخواه */}
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-3 text-gray-700">➕ اسناد دلخواه (اختیاری)</h3>
            
            {formData.custom_documents.map((doc, index) => (
              <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">سند: {doc.name}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomDocument(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-trash"></i> حذف
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">تصویر سند</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleCustomImageChange(index, e.target.files?.[0] || null)}
                      className="input-field text-sm py-2"
                    />
                    {doc.image_preview && (
                      <div className="mt-2">
                        <img src={doc.image_preview} alt="پیش‌نمایش" className="w-32 h-32 object-cover rounded border" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">متن سند</label>
                    <textarea
                      value={doc.text_content}
                      onChange={(e) => handleCustomTextChange(index, e.target.value)}
                      className="input-field text-sm"
                      rows={3}
                      placeholder="متن سند را وارد کنید..."
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customDocName}
                onChange={(e) => setCustomDocName(e.target.value)}
                className="input-field flex-1"
                placeholder="نام سند دلخواه (مثال: فاکتور خرید)"
              />
              <button
                type="button"
                onClick={addCustomDocument}
                className="btn-secondary"
              >
                <i className="fas fa-plus"></i> افزودن
              </button>
            </div>
          </div>
        </div>
        
        {/* دکمه ثبت */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center gap-2"
          >
            <i className="fas fa-save"></i>
            {loading ? 'در حال ثبت...' : '💾 ذخیره اطلاعات موتر و اسناد'}
          </button>
        </div>
      </form>
    </div>
  );
}