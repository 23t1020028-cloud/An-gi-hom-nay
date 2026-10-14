'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Utensils, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/foods?username=${username}&password=${password}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        // Kiểm tra local fallback
        const localPwd = localStorage.getItem(`user_pwd_${username.toLowerCase()}`);
        if (localPwd && localPwd === password) {
          localStorage.setItem('app_user', username);
          router.push('/');
          return;
        }
        setError(data.error || 'Tài khoản hoặc mật khẩu không đúng!');
      } else {
        localStorage.setItem('app_user', username);
        if (data.foods) {
          localStorage.setItem(`foods_${username}`, JSON.stringify(data.foods));
        }
        router.push('/');
      }
    } catch (err) {
      // Local fallback
      localStorage.setItem('app_user', username);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Utensils className="w-8 h-8 text-orange-500" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            Hôm Nay Ăn Gì?
          </h1>
        </div>

        <h2 className="text-xl font-bold text-center mb-1 flex items-center justify-center gap-2">
          <LogIn className="w-5 h-5 text-orange-500" /> Đăng Nhập
        </h2>
        <p className="text-xs text-slate-400 text-center mb-6">
          Nhập tài khoản để vào ứng dụng quay món ăn
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Tên tài khoản</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Nhập tên tài khoản..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-white text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-white text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 font-bold rounded-xl hover:opacity-90 transition-all text-slate-950 text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50 mt-2"
          >
            {loading ? 'Đang Đăng Nhập...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-orange-400 font-bold hover:underline">
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </main>
  );
}