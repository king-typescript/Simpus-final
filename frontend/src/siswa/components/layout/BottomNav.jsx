import { motion } from 'framer-motion';
import { FiHome, FiBook, FiClock, FiUser } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/siswa', label: 'Home', icon: FiHome },
  { path: '/siswa/katalog', label: 'Katalog', icon: FiBook },
  { path: '/siswa/riwayat', label: 'Riwayat', icon: FiClock },
  { path: '/siswa/profil', label: 'Profil', icon: FiUser },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentPath = (path) => {
    if (path === '/siswa') {
      return location.pathname === '/siswa' || location.pathname === '/siswa/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-3 mb-3 sm:mx-5 sm:mb-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border border-gray-100 px-2 py-2 safe-area-inset-bottom transition-all">
        <div className="flex items-stretch justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentPath(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl relative focus:outline-none transition-transform active:scale-95"
              >
                {active && (
                  <div className="absolute inset-0 bg-primary-blue/10 rounded-xl pointer-events-none" />
                )}
                
                <div
                  className={`relative z-10 transition-all duration-200 ${
                    active ? 'text-primary-blue -translate-y-0.5' : 'text-text-sekunder hover:text-primary-blue'
                  }`}
                >
                  <Icon className={`${active ? 'text-xl' : 'text-lg'} transition-all duration-200`} />
                  
                  {active && (
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-accent shadow-sm" />
                  )}
                </div>
                
                <span
                  className={`relative z-10 text-[10px] font-bold mt-1 transition-all duration-200 ${
                    active ? 'text-primary-blue opacity-100 scale-100' : 'text-text-sekunder opacity-80 scale-95'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
