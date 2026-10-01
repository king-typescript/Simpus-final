/**
 * ==============================================================================
 * Layout: Siswa Layout Wrapper
 * Deskripsi: Komponen tata letak utama untuk area siswa. Menampilkan TopNav di desktop,
 *            BottomNav di perangkat seluler, serta menganimasi transisi antar rute (<Outlet />).
 * ==============================================================================
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function SiswaLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans relative overflow-x-hidden pb-24 md:pb-8">
      {/* 1. Header Navigasi Atas (Desktop & Mobile) */}
      <TopNav />
      
      {/* 2. Area Konten Utama Halaman Siswa */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full flex-1"
          >
            {/* Tempat dirender-nya halaman child (Dashboard, Katalog, Riwayat, Profil) */}
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Bar Navigasi Bawah (Buka di Layar Seluler / Tablet) */}
      <BottomNav />
    </div>
  );
}
