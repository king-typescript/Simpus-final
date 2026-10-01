import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../lib/auth.jsx';
import gambarHeader from '../../../assets/image/siswa/satak.png';
import { siswaData } from '../../data/mockData';

const navItems = [
  { path: '/siswa', label: 'Dashboard' },
  { path: '/siswa/katalog', label: 'Katalog Buku' },
  { path: '/siswa/riwayat', label: 'Riwayat' },
];

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isCurrentPath = (path) => {
    if (path === '/siswa') {
      return location.pathname === '/siswa' || location.pathname === '/siswa/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 transition-all">
      <nav
        className={`max-w-7xl mx-auto rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-lg border border-gray-100'
            : 'bg-white shadow-sm border border-gray-100'
        }`}
      >
        {/* Logo Brand */}
        <div
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
          onClick={() => handleNavClick('/siswa')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-sm shrink-0 ring-2 ring-primary-blue/20 group-hover:scale-105 transition-transform">
            <img src={gambarHeader} alt="SimPus Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-dark-navy text-lg sm:text-xl tracking-tight group-hover:text-primary-blue transition-colors">
            SimPus
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 bg-gray-50 rounded-full p-1 border border-gray-100">
          {navItems.map((item) => {
            const active = isCurrentPath(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`relative px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                  active
                    ? 'bg-primary-blue text-white shadow-md'
                    : 'text-text-sekunder hover:text-primary-blue hover:bg-gray-100/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Section: User Profile & Mobile Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-text-utama leading-tight">{user?.name || siswaData.namaPanggilan}</p>
            <p className="text-[11px] text-text-sekunder font-mono">{user?.nis || siswaData.nisn}</p>
          </div>

          <button
            onClick={() => handleNavClick('/siswa/profil')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 overflow-hidden shrink-0 transition-all duration-200 hover:scale-105 ${
              location.pathname === '/siswa/profil' ? 'border-accent ring-2 ring-accent/30 shadow-md' : 'border-primary-blue/30'
            }`}
            title="Lihat Profil Saya"
          >
            <img
              src={user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=102E68&color=fff` : siswaData.avatar}
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Tombol Logout Desktop (Hanya Tampil di Desktop) */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center justify-center p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-colors rounded-xl focus:outline-none"
            title="Keluar"
          >
            <FiLogOut className="w-5 h-5" />
          </button>

          {/* Hamburger Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-dark-navy bg-gray-100 hover:bg-primary-blue hover:text-white transition-colors rounded-xl focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden max-w-7xl mx-auto mt-2 overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-xl p-3 space-y-1 border border-gray-100">
              {[...navItems, { path: '/siswa/profil', label: 'Profil Saya' }].map((item) => {
                const active = isCurrentPath(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                      active
                        ? 'bg-primary-blue text-white shadow-sm'
                        : 'text-text-sekunder hover:bg-gray-50 hover:text-primary-blue'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              
              {/* Tombol Logout Mobile */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-colors mt-2 border-t border-gray-100"
              >
                Keluar (Logout)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
