import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { supabase } from '../utils/supabase';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      setLoading(false);
      return;
    }

    try {
      // Fetch admin user from custom admin table
      const { data: admins, error: queryError } = await supabase
        .from('admin')
        .select('*')
        .eq('admin', username);

      if (queryError) {
        console.error('Database query error:', queryError);
        setError('حدث خطأ أثناء الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.');
        setLoading(false);
        return;
      }

      if (!admins || admins.length === 0) {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
        setLoading(false);
        return;
      }

      const adminUser = admins[0];

      // Compare password input with stored bcrypt hash
      const isMatch = bcrypt.compareSync(password, adminUser.password);

      if (isMatch) {
        // Login success! Set session in localStorage
        localStorage.setItem('adminSession', JSON.stringify({
          loggedIn: true,
          username: adminUser.admin,
          loginTime: Date.now()
        }));
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('حدث خطأ غير متوقع. يرجى إعادة المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[140px] pb-24 min-h-[80vh] flex items-center justify-center px-6 bg-surface-container-low text-right">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-outline-variant/30 p-8 md:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-error text-5xl mb-2">admin_panel_settings</span>
          <h2 className="text-2xl font-bold text-on-surface">تسجيل دخول المشرف</h2>
          <p className="text-sm text-on-surface-variant mt-1">لوحة إدارة المعروضات والمنتجات</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-4 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              className="w-full px-4 py-3 rounded-lg border border-outline focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all text-right"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-outline focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all text-right"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-error hover:bg-error/95 disabled:bg-error/55 text-white font-bold py-3.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري التحقق...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
