// app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentRates, setMonthlyRates, getCurrentCustomer } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // نرخ‌های مالیاتی
  const [rates, setRates] = useState({
    usd_to_afn: 70,
    brt_rate: 4,
    red_crescent_rate: 2,
    municipality_rate: 0.4,
    fixed_tax_licensed: 2,
    fixed_tax_unlicensed: 3
  });
  
  // تنظیمات عمومی
  const [generalSettings, setGeneralSettings] = useState({
    company_name: 'شرکت تجارتی عثمان عثمانی کاکر لمیتد',
    company_phone: '+93 123 456 789',
    company_email: 'info@osmani.com',
    company_address: 'کابل، افغانستان',
    tax_office: 'اداره گمرک کابل'
  });
  
  // پروفایل ادمین
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentCustomer();
        setAdmin(user);
        setProfile({
          ...profile,
          name: user.name || '',
          username: user.username || '',
          email: user.email || ''
        });
        
        const ratesData = await getCurrentRates();
        setRates(ratesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

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

  const handleSaveGeneral = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // ذخیره در localStorage برای دمو
      localStorage.setItem('company_settings', JSON.stringify(generalSettings));
      setMessage({ type: 'success', text: 'تنظیمات عمومی با موفقیت ذخیره شد' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'خطا در ذخیره تنظیمات' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.new_password && profile.new_password !== profile.confirm_password) {
      setMessage({ type: 'error', text: 'رمز عبور جدید با تکرار آن مطابقت ندارد' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      // در اینجا API آپدیت پروفایل را فراخوانی کنید
      setMessage({ type: 'success', text: 'پروفایل با موفقیت به روز شد' });
      setProfile({ ...profile, current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'خطا در به روز رسانی پروفایل' });
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setRates({ ...rates, [field]: numValue });
    }
  };

  const [activeTab, setActiveTab] = useState<'rates' | 'general' | 'profile'>('rates');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a4a6a]">⚙️ تنظیمات سیستم</h1>
        <p className="text-gray-500 text-sm">مدیریت نرخ‌ها، تنظیمات عمومی و پروفایل</p>
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg text-center mb-4 ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* تب‌ها */}
      <div className="flex gap-2 border-b bg-white rounded-t-xl px-4 mb-6">
        <button
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'rates' 
              ? 'border-b-2 border-[#2c5f2d] text-[#2c5f2d]' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-dollar-sign ml-1"></i> نرخ ارز و مالیات
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'general' 
              ? 'border-b-2 border-[#2c5f2d] text-[#2c5f2d]' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-building ml-1"></i> تنظیمات عمومی
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'profile' 
              ? 'border-b-2 border-[#2c5f2d] text-[#2c5f2d]' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-user-cog ml-1"></i> پروفایل ادمین
        </button>
      </div>
      
      {/* تب نرخ ارز و مالیات */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#1a4a6a] mb-4">💰 نرخ ارز و مالیات</h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">💵 نرخ دلار (USD to AFN)</label>
                <input
                  type="number"
                  value={rates.usd_to_afn}
                  onChange={(e) => handleRateChange('usd_to_afn', e.target.value)}
                  step="0.5"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">📊 مالیات BRT (%)</label>
                <input
                  type="number"
                  value={rates.brt_rate}
                  onChange={(e) => handleRateChange('brt_rate', e.target.value)}
                  step="0.1"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">❤️ مالیات هلال احمر (%)</label>
                <input
                  type="number"
                  value={rates.red_crescent_rate}
                  onChange={(e) => handleRateChange('red_crescent_rate', e.target.value)}
                  step="0.1"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">🏢 مالیات شهرداری (%)</label>
                <input
                  type="number"
                  value={rates.municipality_rate}
                  onChange={(e) => handleRateChange('municipality_rate', e.target.value)}
                  step="0.1"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">✅ مالیات ثابت (دارای جواز) (%)</label>
                <input
                  type="number"
                  value={rates.fixed_tax_licensed}
                  onChange={(e) => handleRateChange('fixed_tax_licensed', e.target.value)}
                  step="0.1"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">❌ مالیات ثابت (بدون جواز) (%)</label>
                <input
                  type="number"
                  value={rates.fixed_tax_unlicensed}
                  onChange={(e) => handleRateChange('fixed_tax_unlicensed', e.target.value)}
                  step="0.1"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
              </div>
            </div>
            
            <button
              onClick={handleSaveRates}
              disabled={loading}
              className="w-full bg-[#2c5f2d] text-white py-3 rounded-lg hover:bg-[#1a3a1a] transition flex items-center justify-center gap-2 font-semibold"
            >
              <i className="fas fa-save"></i>
              {loading ? 'در حال ذخیره...' : 'ذخیره نرخ‌ها'}
            </button>
          </div>
        </div>
      )}
      
      {/* تب تنظیمات عمومی */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#1a4a6a] mb-4">🏢 تنظیمات عمومی</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">نام شرکت</label>
              <input
                type="text"
                value={generalSettings.company_name}
                onChange={(e) => setGeneralSettings({ ...generalSettings, company_name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">شماره تماس</label>
                <input
                  type="text"
                  value={generalSettings.company_phone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, company_phone: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">ایمیل</label>
                <input
                  type="email"
                  value={generalSettings.company_email}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, company_email: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                />
              </div>
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">آدرس</label>
              <textarea
                value={generalSettings.company_address}
                onChange={(e) => setGeneralSettings({ ...generalSettings, company_address: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">اداره گمرک</label>
              <input
                type="text"
                value={generalSettings.tax_office}
                onChange={(e) => setGeneralSettings({ ...generalSettings, tax_office: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
              />
            </div>
            
            <button
              onClick={handleSaveGeneral}
              disabled={loading}
              className="w-full bg-[#2c5f2d] text-white py-3 rounded-lg hover:bg-[#1a3a1a] transition flex items-center justify-center gap-2 font-semibold"
            >
              <i className="fas fa-save"></i>
              {loading ? 'در حال ذخیره...' : 'ذخیره تنظیمات عمومی'}
            </button>
          </div>
        </div>
      )}
      
      {/* تب پروفایل ادمین */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#1a4a6a] mb-4">👤 پروفایل ادمین</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">نام کامل</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                required
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">نام کاربری</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                required
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">ایمیل</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
              />
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-bold text-gray-700 mb-3">تغییر رمز عبور</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">رمز عبور فعلی</label>
                  <input
                    type="password"
                    value={profile.current_password}
                    onChange={(e) => setProfile({ ...profile, current_password: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">رمز عبور جدید</label>
                    <input
                      type="password"
                      value={profile.new_password}
                      onChange={(e) => setProfile({ ...profile, new_password: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">تکرار رمز عبور جدید</label>
                    <input
                      type="password"
                      value={profile.confirm_password}
                      onChange={(e) => setProfile({ ...profile, confirm_password: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2c5f2d] text-white py-3 rounded-lg hover:bg-[#1a3a1a] transition flex items-center justify-center gap-2 font-semibold"
            >
              <i className="fas fa-save"></i>
              {loading ? 'در حال ذخیره...' : 'به روز رسانی پروفایل'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}