import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiCheck, FiMail, FiPhone, FiHome, FiLock, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../lib/auth.jsx';

export default function ProfileForm() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    telepon: user?.phone || '',
    alamat: user?.address || '',
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-7 lg:col-span-2">
      <h3 className="font-bold text-base sm:text-lg text-dark-navy mb-5 border-b border-gray-100 pb-3 flex items-center justify-between">
        <span>Informasi Akun</span>
        <span className="text-xs font-normal text-text-sekunder flex items-center gap-1">
          <FiLock className="text-xs" /> Terverifikasi
        </span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Read-only academic data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-sekunder mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={user?.name || '-'}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 text-gray-500 rounded-2xl border border-gray-200 cursor-not-allowed text-xs sm:text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-sekunder mb-1.5">
              NISN
            </label>
            <input
              type="text"
              value={user?.nis || '-'}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 text-gray-500 rounded-2xl border border-gray-200 cursor-not-allowed text-xs sm:text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-sekunder mb-1.5">
              Kelas
            </label>
            <input
              type="text"
              value={user?.className || '-'}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 text-gray-500 rounded-2xl border border-gray-200 cursor-not-allowed text-xs sm:text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-sekunder mb-1.5">
              Status Keanggotaan
            </label>
            <input
              type="text"
              value={user?.status || 'Aktif'}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 text-gray-500 rounded-2xl border border-gray-200 cursor-not-allowed text-xs sm:text-sm font-medium"
            />
          </div>
        </div>

        {/* Editable contacts */}
        <div className="pt-2 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-dark-navy mb-4">Kontak Siswa</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-sekunder mb-1.5 flex items-center gap-1.5">
                <FiMail className="text-primary-blue text-xs" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-text-utama focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-light-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-sekunder mb-1.5 flex items-center gap-1.5">
                <FiPhone className="text-primary-blue text-xs" /> Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-text-utama focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-light-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-sekunder mb-1.5 flex items-center gap-1.5">
                <FiHome className="text-primary-blue text-xs" /> Alamat Domisili
              </label>
              <textarea
                name="alamat"
                rows={3}
                value={formData.alamat}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-text-utama focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-light-blue transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full"
              >
                <FiCheckCircle className="text-sm" />
                <span>Perubahan disimpan!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm hover:shadow transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <FiLogOut className="text-sm" />
              <span>Keluar</span>
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-blue hover:bg-dark-navy text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm hover:shadow transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <FiCheck className="text-sm" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
