import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';

import gambarHeader from '../assets/image/siswa/bg-perpus.jpeg';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [peran, setPeran] = useState('siswa');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Harap isi semua kolom');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      // Implementasi request ke Auth Service API
      const res = await login({
        username: identifier, // Backend menerima field bernama 'username'
        password: password,
      });

      // Arahkan ke dashboard sesuai role yang dikembalikan backend
      const userRole = res?.user?.role;
      if (userRole === 'PUSTAKAWAN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/siswa', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = (role) => {
    setPeran(role);
    setIdentifier('');
    setPassword('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background ambient shape untuk estetika */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-blue/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

      {/* ================= TOMBOL KEMBALI (FLOATING DESKTOP/MOBILE) ================= */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:top-8 lg:left-8 z-20"
      >
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/80 backdrop-blur-md text-slate-700 hover:text-primary-blue hover:bg-white rounded-full shadow-sm hover:shadow transition-all duration-300 font-medium text-sm sm:text-base border border-slate-200/50"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>Kembali</span>
        </Link>
      </motion.div>

      {/* Kotak (Card) Login Utama */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-3xl shadow-card overflow-hidden relative bg-white z-10 mt-12 sm:mt-0"
      >
        {/* ================= 1. BACKGROUND HEADER FORM ================= */}
        <div className="relative pt-10 pb-8 px-6 text-center bg-dark-navy overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: `url(${gambarHeader})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-transparent to-transparent opacity-90"></div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative z-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">SIMPUS SATAK</h2>
            <p className="text-light-blue text-sm sm:text-base mt-2 opacity-90 font-medium">Sistem Perpustakaan Digital Terpadu</p>
          </motion.div>
        </div>

        {/* ================= 2. BACKGROUND BODY FORM ================= */}
        <div className="relative p-6 sm:p-8 bg-bg-color">
          {/* ================= 3. TOMBOL PILIHAN (DENGAN ANIMASI SLIDER FRAMER MOTION) ================= */}
          <div className="relative flex bg-slate-100 rounded-full p-1 mb-8 shadow-inner overflow-hidden">
            {['siswa', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleChangeRole(role)}
                disabled={isLoading}
                className={`relative flex-1 py-2.5 sm:py-3 rounded-full text-sm font-bold transition-colors duration-300 z-10 disabled:opacity-50 ${peran === role ? (role === 'siswa' ? 'text-white' : 'text-white') : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {peran === role && (
                  <motion.div
                    layoutId="activeRoleTab"
                    className={`absolute inset-0 rounded-full shadow-sm -z-10 ${role === 'siswa' ? 'bg-primary-blue' : 'bg-accent'}`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">{role === 'siswa' ? 'Siswa / Peminjam' : 'Admin / Penjaga'}</span>
              </button>
            ))}
          </div>

          {/* ================= 4. FORM INPUT ================= */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message Alert */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2 overflow-hidden"
                >
                  <span className="flex-1">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Identifier dengan AnimatePresence agar transisi label halus */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                {peran === 'siswa' ? 'Username Siswa' : 'Username Admin'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={peran === 'siswa' ? 'Contoh: siswa001' : 'Contoh: admin'}
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full h-12 px-4 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 text-slate-800 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full h-12 pl-4 pr-12 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 text-slate-800 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  tabIndex="-1"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none rounded-lg focus:ring-2 focus:ring-primary-blue/20"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                className="text-sm font-semibold text-primary-blue hover:text-dark-navy transition-colors focus:outline-none focus:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* ================= 5. TOMBOL SUBMIT ================= */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 mt-2 rounded-xl text-white font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-300 ease-out flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-offset-1
                ${isLoading ? 'opacity-80 cursor-not-allowed' : 'active:scale-[0.98]'}
                ${peran === 'siswa'
                  ? 'bg-primary-blue hover:bg-dark-navy focus:ring-primary-blue/30'
                  : 'bg-accent hover:bg-teal-700 focus:ring-accent/30'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}


