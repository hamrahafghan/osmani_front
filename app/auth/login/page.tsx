// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginCustomer } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await loginCustomer(username, password);
      const { token, role, id, name, customer_type } = result.data;
      
      // ذخیره در localStorage
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_data', JSON.stringify(result.data));
      
      // تنظیم کوکی برای middleware
      document.cookie = `customer_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      
      // ریدایرکت بر اساس نقش
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/customer');
      }
      
    } catch (err: any) {
      setError(err.message || 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b2b3b] to-[#1a4a6a]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-gavel text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-[#1a4a6a]">ورود به سامانه</h1>
          <p className="text-gray-500 mt-2">شرکت تجارتی عثمان عثمانی کاکر لمیتد</p>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none transition"
              placeholder="نام کاربری خود را وارد کنید"
              required
              dir="ltr"
            />
          </div>
          
          <div>
            <label className="block font-semibold mb-2 text-gray-700">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#2c5f2d] outline-none transition"
              placeholder="رمز عبور خود را وارد کنید"
              required
              dir="ltr"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-3 rounded-xl font-bold text-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin ml-2"></i>
                در حال ورود...
              </>
            ) : (
              'ورود'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}