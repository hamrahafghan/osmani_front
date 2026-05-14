'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCurrentRates, setMonthlyRates } from '@/lib/api';
import { getTranslation, type Locale } from '@/lib/translations';

const API_URL = 'http://localhost:5000/api';

interface Backup {
  id: string;
  type: 'database' | 'uploads' | 'full';
  name: string;
  filename: string;
  size: string;
  files_count?: number;
  created_at: string;
  collections?: string[];
}

export default function SettingsPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'fa';
  const t = (key: string) => getTranslation(locale, key);
  
  const [rates, setRates] = useState({
    usd_to_afn: 70,
    brt_rate: 4,
    red_crescent_rate: 2,
    municipality_rate: 0.4,
    fixed_tax_licensed: 2,
    fixed_tax_unlicensed: 3
  });
  
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'database' | 'uploads'>('database');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ratesData = await getCurrentRates();
        setRates(ratesData);
        await loadBackups();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const loadBackups = async () => {
    try {
      const res = await fetch(`${API_URL}/backup/list`);
      const data = await res.json();
      if (data.success) {
        setBackups(data.data);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };

  const handleSaveRates = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await setMonthlyRates(rates);
      setMessage({ type: 'success', text: 'نرخ‌ها با موفقیت ذخیره شد' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'خطا در ذخیره نرخ‌ها' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async (type: 'database' | 'uploads' | 'full') => {
    setBackupLoading(true);
    setMessage(null);
    try {
      let endpoint = '';
      let successMessage = '';
      
      if (type === 'database') {
        endpoint = `${API_URL}/backup/backup/database`;
        successMessage = 'بکاپ دیتابیس با موفقیت ایجاد شد';
      } else if (type === 'uploads') {
        endpoint = `${API_URL}/backup/backup/uploads`;
        successMessage = 'بکاپ عکس‌ها با موفقیت ایجاد شد';
      } else {
        endpoint = `${API_URL}/backup/backup/full`;
        successMessage = 'بکاپ کامل با موفقیت ایجاد شد';
      }
      
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: successMessage });
        await loadBackups();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'خطا در ایجاد بکاپ' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async (id: string, type: string, name: string) => {
    const typeText = type === 'database' ? 'دیتابیس' : (type === 'uploads' ? 'عکس‌ها' : 'کامل');
    if (confirm(`آیا از بازیابی ${typeText} "${name}" اطمینان دارید؟\nداده‌های فعلی جایگزین خواهند شد.`)) {
      setBackupLoading(true);
      setMessage(null);
      try {
        const endpoint = type === 'database' 
          ? `${API_URL}/backup/restore/database/${id}`
          : `${API_URL}/backup/restore/uploads/${id}`;
        
        const res = await fetch(endpoint, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: 'success', text: `${typeText} با موفقیت بازیابی شد` });
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'خطا در بازیابی' });
      } finally {
        setBackupLoading(false);
      }
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    window.open(`${API_URL}/backup/download/${id}`, '_blank');
  };

  const handleDeleteBackup = async (id: string, name: string) => {
    if (confirm(`آیا از حذف بکاپ "${name}" اطمینان دارید؟`)) {
      try {
        const res = await fetch(`${API_URL}/backup/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: 'success', text: 'بکاپ با موفقیت حذف شد' });
          await loadBackups();
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'خطا در حذف بکاپ' });
      }
    }
  };

  const handleRateChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setRates({ ...rates, [field]: numValue });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US');
  };

  const filteredBackups = backups.filter(b => activeTab === 'database' ? b.type === 'database' : b.type === 'uploads');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1a4a6a] mb-8">⚙️ تنظیمات سیستم</h1>
      
      {message && (
        <div className={`p-3 rounded-lg text-center mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* بخش نرخ ارز و مالیات */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-[#1a4a6a] mb-4">💰 نرخ ارز و مالیات</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">💵 نرخ دلار (USD to AFN)</label>
            <input
              type="number"
              value={rates.usd_to_afn}
              onChange={(e) => handleRateChange('usd_to_afn', e.target.value)}
              step="0.5"
              className="input-field"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">مالیات BRT (%)</label>
              <input
                type="number"
                value={rates.brt_rate}
                onChange={(e) => handleRateChange('brt_rate', e.target.value)}
                step="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">مالیات هلال احمر (%)</label>
              <input
                type="number"
                value={rates.red_crescent_rate}
                onChange={(e) => handleRateChange('red_crescent_rate', e.target.value)}
                step="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">مالیات شهرداری (%)</label>
              <input
                type="number"
                value={rates.municipality_rate}
                onChange={(e) => handleRateChange('municipality_rate', e.target.value)}
                step="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">مالیات ثابت (دارای جواز) (%)</label>
              <input
                type="number"
                value={rates.fixed_tax_licensed}
                onChange={(e) => handleRateChange('fixed_tax_licensed', e.target.value)}
                step="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">مالیات ثابت (بدون جواز) (%)</label>
              <input
                type="number"
                value={rates.fixed_tax_unlicensed}
                onChange={(e) => handleRateChange('fixed_tax_unlicensed', e.target.value)}
                step="0.1"
                className="input-field"
              />
            </div>
          </div>
          
          <button
            onClick={handleSaveRates}
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            <i className="fas fa-save"></i>
            {loading ? 'در حال ذخیره...' : 'ذخیره نرخ‌ها'}
          </button>
        </div>
      </div>
      
      {/* بخش بکاپ دیتابیس و عکس */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-[#1a4a6a] mb-4">💾 بکاپ و بازیابی</h2>
        
        {/* دکمه‌های بکاپ */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => handleBackup('database')}
            disabled={backupLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <i className="fas fa-database"></i>
            بکاپ دیتابیس
          </button>
          <button
            onClick={() => handleBackup('uploads')}
            disabled={backupLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <i className="fas fa-image"></i>
            بکاپ عکس‌ها
          </button>
          <button
            onClick={() => handleBackup('full')}
            disabled={backupLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <i className="fas fa-archive"></i>
            بکاپ کامل
          </button>
        </div>
        
        {/* تب‌ها */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'database' 
                ? 'border-b-2 border-[#2c5f2d] text-[#2c5f2d]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 بکاپ دیتابیس
          </button>
          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'uploads' 
                ? 'border-b-2 border-[#2c5f2d] text-[#2c5f2d]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🖼️ بکاپ عکس‌ها
          </button>
        </div>
        
        {filteredBackups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-archive text-4xl mb-2"></i>
            <p>هیچ بکاپی یافت نشد</p>
            <p className="text-sm">برای ایجاد بکاپ روی دکمه‌های بالا کلیک کنید</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-right">نام بکاپ</th>
                  <th className="p-3 text-right">تاریخ</th>
                  <th className="p-3 text-right">حجم</th>
                  {activeTab === 'uploads' && <th className="p-3 text-right">تعداد فایل</th>}
                  <th className="p-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredBackups.map((backup) => (
                  <tr key={backup.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{backup.name}</td>
                    <td className="p-3">{formatDate(backup.created_at)}</td>
                    <td className="p-3">{backup.size}</td>
                    {activeTab === 'uploads' && (
                      <td className="p-3">{backup.files_count || '-'} فایل</td>
                    )}
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(backup.id, backup.filename)}
                          className="text-blue-500 hover:text-blue-700"
                          title="دانلود"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                        <button
                          onClick={() => handleRestore(backup.id, backup.type, backup.name)}
                          className="text-green-500 hover:text-green-700"
                          title="بازیابی"
                        >
                          <i className="fas fa-undo-alt"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id, backup.name)}
                          className="text-red-500 hover:text-red-700"
                          title="حذف"
                        >
                          <i className="fas fa-trash"></i>
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