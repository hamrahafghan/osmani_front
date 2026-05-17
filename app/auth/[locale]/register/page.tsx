'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { registerCustomer } from '@/lib/api';

export default function RegisterPage() {
  const params = useParams();
  const locale = params?.locale as string || 'fa';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    customer_type: 'company',
    name: '',
    phone: '',
    email: '',
    address: '',
    username: '',
    password: '',
    confirmPassword: '',
    registration_number: '',
    tax_number: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      setLoading(false);
      return;
    }
    
    try {
      const result = await registerCustomer({
        customer_type: formData.customer_type,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        username: formData.username,
        password: formData.password,
        registration_number: formData.registration_number,
        tax_number: formData.tax_number
      });
      
      setMessage(result.message || 'ثبت‌نام با موفقیت انجام شد. پس از تأیید ادمین می‌توانید وارد شوید.');
      
      // پاک کردن فرم
      setFormData({
        customer_type: 'company',
        name: '', phone: '', email: '', address: '',
        username: '', password: '', confirmPassword: '',
        registration_number: '', tax_number: ''
      });
      
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1a4a6a]">ثبت‌نام</h1>
          <p className="text-gray-500 mt-2">سامانه گمرکی شرکت عثمان عثمانی کاکر لمیتد</p>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">نام کامل *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">نام کاربری *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">رمز عبور *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">تکرار رمز عبور *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">ایمیل</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">تلفن</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none"
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-bold mb-3">اطلاعات شرکت</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">شماره ثبت شرکت</label>
                <input
                  type="text"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">شماره مالیاتی</label>
                <input
                  type="text"
                  value={formData.tax_number}
                  onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none"
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-3 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>
        
        <p className="text-center text-gray-500 mt-6 text-sm">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <a href={`/${locale}/login`} className="text-[#2c5f2d] font-semibold">
            وارد شوید
          </a>
        </p>
      </div>
    </div>
  );
}