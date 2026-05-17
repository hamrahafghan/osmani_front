// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCustomers, approveUser, rejectUser, type Customer } from '@/lib/api';

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  
  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getCustomers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (confirm('آیا از تأیید این کاربر مطمئن هستید؟')) {
      try {
        await approveUser(userId);
        loadUsers();
        alert('کاربر با موفقیت تأیید شد');
      } catch (error) {
        console.error('Error approving user:', error);
        alert('خطا در تأیید کاربر');
      }
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('لطفاً دلیل رد کردن را وارد کنید:');
    if (reason) {
      try {
        await rejectUser(userId, reason);
        loadUsers();
        alert('کاربر با موفقیت رد شد');
      } catch (error) {
        console.error('Error rejecting user:', error);
        alert('خطا در رد کاربر');
      }
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.includes(searchTerm) || 
        u.username.includes(searchTerm) ||
        u.email?.includes(searchTerm)
      );
    }
    
    return filtered;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      blocked: 'bg-gray-100 text-gray-800'
    };
    const texts: Record<string, string> = {
      pending: 'در انتظار',
      active: 'فعال',
      rejected: 'رد شده',
      blocked: 'مسدود'
    };
    return <span className={`px-2 py-1 rounded-full text-xs ${styles[status]}`}>{texts[status]}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a4a6a]">مدیریت کاربران</h1>
        <p className="text-gray-500 text-sm">مدیریت و تأیید کاربران سیستم</p>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-blue-500">
          <div className="text-gray-500 text-sm">کل کاربران</div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <i className="fas fa-users text-blue-500 text-2xl float-left mt-2"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-green-500">
          <div className="text-gray-500 text-sm">کاربران فعال</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <i className="fas fa-check-circle text-green-500 text-2xl float-left mt-2"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-yellow-500">
          <div className="text-gray-500 text-sm">در انتظار تأیید</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <i className="fas fa-clock text-yellow-500 text-2xl float-left mt-2"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-red-500">
          <div className="text-gray-500 text-sm">رد شده</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <i className="fas fa-times-circle text-red-500 text-2xl float-left mt-2"></i>
        </div>
      </div>

      {/* جستجو */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="relative">
          <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
          <input
            type="text"
            placeholder="جستجوی کاربران (نام، نام کاربری، ایمیل)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
          />
        </div>
      </div>

      {/* لیست کاربران */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-right">نام</th>
                <th className="p-3 text-right">نام کاربری</th>
                <th className="p-3 text-right">نوع</th>
                <th className="p-3 text-right">ایمیل</th>
                <th className="p-3 text-right">نقش</th>
                <th className="p-3 text-right">وضعیت</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-gray-600">{user.username}</td>
                  <td className="p-3">
                    {user.customer_type === 'company' ? (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        <i className="fas fa-building ml-1"></i> شرکت
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        <i className="fas fa-user ml-1"></i> شخص
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600">{user.email || '-'}</td>
                  <td className="p-3">
                    {user.role === 'admin' ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        <i className="fas fa-shield-alt ml-1"></i> ادمین
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        <i className="fas fa-user ml-1"></i> مشتری
                      </span>
                    )}
                  </td>
                  <td className="p-3">{getStatusBadge(user.status)}</td>
                  <td className="p-3">
                    {user.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                        >
                          <i className="fas fa-check ml-1"></i> تأیید
                        </button>
                        <button
                          onClick={() => handleReject(user._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                        >
                          <i className="fas fa-times ml-1"></i> رد
                        </button>
                      </div>
                    )}
                    {user.status === 'active' && (
                      <span className="text-green-600 text-sm">✓ تأیید شده</span>
                    )}
                    {user.status === 'rejected' && (
                      <span className="text-red-600 text-sm">✗ رد شده</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-users text-5xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">کاربری یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}