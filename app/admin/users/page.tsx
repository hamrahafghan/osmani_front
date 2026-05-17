// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  customer_type: string;
  status: string;
  role: string;
  createdAt: string;
  rejection_reason?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected' | 'blocked'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('https://osmani-backend.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, action: string, reason?: string) => {
    const token = localStorage.getItem('customer_token');
    let url = `https://osmani-backend.onrender.com/api/admin/users/${userId}/${action}`;
    let body: any = {};
    
    if (action === 'reject') {
      body = { reason: reason || 'No reason provided' };
    }
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      if (data.success) {
        loadUsers();
        setShowRejectModal(false);
        setRejectionReason('');
        alert(`کاربر با موفقیت ${action === 'approve' ? 'تأیید' : action === 'reject' ? 'رد' : action === 'block' ? 'مسدود' : 'فعال'} شد`);
      } else {
        alert(data.message || 'خطا در تغییر وضعیت کاربر');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    const token = localStorage.getItem('customer_token');
    
    try {
      const response = await fetch(`https://osmani-backend.onrender.com/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      
      const data = await response.json();
      if (data.success) {
        loadUsers();
        alert(`نقش کاربر با موفقیت به ${role === 'admin' ? 'ادمین' : 'مشتری'} تغییر کرد`);
      } else {
        alert(data.message || 'خطا در تغییر نقش کاربر');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('خطا در ارتباط با سرور');
    }
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

  const filteredUsers = users.filter(user => filter === 'all' ? true : user.status === filter);

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
    rejected: users.filter(u => u.status === 'rejected').length,
    blocked: users.filter(u => u.status === 'blocked').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-[#1a4a6a]"></i>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a4a6a]">👥 مدیریت کاربران</h1>
        <p className="text-gray-500 text-sm">مدیریت و تأیید کاربران سیستم</p>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div 
          onClick={() => setFilter('all')}
          className={`bg-white rounded-xl shadow-md p-4 border-r-4 cursor-pointer transition ${filter === 'all' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}
        >
          <div className="text-gray-500 text-sm">کل کاربران</div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <i className="fas fa-users text-blue-500 text-2xl float-left mt-2"></i>
        </div>
        <div 
          onClick={() => setFilter('pending')}
          className={`bg-white rounded-xl shadow-md p-4 border-r-4 cursor-pointer transition ${filter === 'pending' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-300'}`}
        >
          <div className="text-gray-500 text-sm">در انتظار تأیید</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <i className="fas fa-clock text-yellow-500 text-2xl float-left mt-2"></i>
        </div>
        <div 
          onClick={() => setFilter('active')}
          className={`bg-white rounded-xl shadow-md p-4 border-r-4 cursor-pointer transition ${filter === 'active' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300'}`}
        >
          <div className="text-gray-500 text-sm">کاربران فعال</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <i className="fas fa-check-circle text-green-500 text-2xl float-left mt-2"></i>
        </div>
        <div 
          onClick={() => setFilter('rejected')}
          className={`bg-white rounded-xl shadow-md p-4 border-r-4 cursor-pointer transition ${filter === 'rejected' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
        >
          <div className="text-gray-500 text-sm">رد شده</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <i className="fas fa-times-circle text-red-500 text-2xl float-left mt-2"></i>
        </div>
        <div 
          onClick={() => setFilter('blocked')}
          className={`bg-white rounded-xl shadow-md p-4 border-r-4 cursor-pointer transition ${filter === 'blocked' ? 'border-gray-500 ring-2 ring-gray-200' : 'border-gray-300'}`}
        >
          <div className="text-gray-500 text-sm">مسدود شده</div>
          <div className="text-2xl font-bold text-gray-600">{stats.blocked}</div>
          <i className="fas fa-ban text-gray-500 text-2xl float-left mt-2"></i>
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
                <th className="p-3 text-right">ایمیل</th>
                <th className="p-3 text-right">نوع</th>
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
                  <td className="p-3 text-gray-600">{user.email || '-'}</td>
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
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user._id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                    >
                      <option value="customer">مشتری</option>
                      <option value="admin">ادمین</option>
                    </select>
                  </td>
                  <td className="p-3">{getStatusBadge(user.status)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateUserStatus(user._id, 'approve')}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                            title="تأیید"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRejectModal(true);
                            }}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                            title="رد"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                      {user.status === 'active' && (
                        <>
                          <button
                            onClick={() => updateUserStatus(user._id, 'block')}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition"
                            title="مسدود"
                          >
                            <i className="fas fa-ban"></i>
                          </button>
                          <button
                            onClick={() => updateUserRole(user._id, user.role === 'admin' ? 'customer' : 'admin')}
                            className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition"
                            title="تغییر نقش"
                          >
                            <i className="fas fa-exchange-alt"></i>
                          </button>
                        </>
                      )}
                      {user.status === 'blocked' && (
                        <button
                          onClick={() => updateUserStatus(user._id, 'activate')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                          title="فعال کردن"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                      )}
                    </div>
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

      {/* مودال رد کاربر */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">رد کاربر</h2>
            <p className="text-gray-600 mb-4">
              آیا از رد کردن <span className="font-bold">{selectedUser.name}</span> مطمئن هستید؟
            </p>
            <div className="mb-4">
              <label className="block font-semibold mb-2">دلیل رد (اختیاری)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a6a]"
                rows={3}
                placeholder="دلیل رد کردن را وارد کنید..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => updateUserStatus(selectedUser._id, 'reject', rejectionReason)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
              >
                رد کردن
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}