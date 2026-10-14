import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { AdminSchoolService } from '../services/adminSchool.js';

export default function SuperAdminLogin() {
  const { user, loginSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Jika sudah memiliki sesi SUPERADMIN aktif, langsung arahkan ke dashboard
  useEffect(() => {
    if (user?.role === 'SUPERADMIN') {
      navigate('/superadmin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await AdminSchoolService.login({
        username: username.trim(),
        password,
      });
      const data = res.data;
      if (!data) {
        throw new Error(data?.error || 'Login gagal.');
      }

      // Perbarui sesi SuperAdmin di context secara sinkron
      loginSuperAdmin(
        {
          id: data.user?.id,
          username: data.user?.username,
          name: data.user?.name,
          role: 'SUPERADMIN',
        }
      );

      navigate('/superadmin', { replace: true });
    } catch (err) {
      const serverMsg = err.response?.data?.error;
      const status = err.response?.status;
      if (status === 429) {
        setError(serverMsg || 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit.');
      } else if (status === 401) {
        setError(serverMsg || 'Username atau password Super Admin salah.');
      } else {
        setError(serverMsg || err.message || 'Gagal terhubung ke server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow border p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Super Admin — Satak</h1>
          <p className="text-sm text-slate-500 mt-1">Portal pengelolaan sekolah pelanggan SIMPUS</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username Super Admin" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Kata Sandi" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500" required />
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-lg hover:bg-black disabled:opacity-60">
            {loading ? 'Memproses…' : 'Masuk ke Dashboard'}
          </button>
        </form>
        <p className="text-xs text-slate-400">Akun awal: superadmin / SuperAdmin123!</p>
      </div>
    </div>
  );
}
