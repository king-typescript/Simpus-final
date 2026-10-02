/**
 * ==============================================================================
 * SIMPUS SATAK - Main Application Router
 * ==============================================================================
 * File ini merupakan Single Source of Truth untuk seluruh perutean aplikasi.
 * Menggunakan React Router v6 dan dynamic import (React.lazy) untuk code-splitting
 * agar performa inisialisasi aplikasi tetap cepat dan efisien.
 */

import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './lib/auth.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'

// --- Halaman Publik (Landing Page & Otentikasi) ---
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))

// --- Modul Admin Perpustakaan ---
const AdminLayout = lazy(() => import('./admin/components/AdminLayout.jsx'))
const DashboardAdmin = lazy(() => import('./pages/admin/Dashboard.jsx'))
const BukuAdmin = lazy(() => import('./pages/admin/Buku.jsx'))
const AnggotaAdmin = lazy(() => import('./pages/admin/Anggota.jsx'))
const SirkulasiAdmin = lazy(() => import('./pages/admin/Sirkulasi.jsx'))
const DendaAdmin = lazy(() => import('./pages/admin/Denda.jsx'))
const LaporanAdmin = lazy(() => import('./pages/admin/Laporan.jsx'))
const PengaturanAdmin = lazy(() => import('./pages/admin/Pengaturan.jsx'))

// --- Modul Siswa / Peminjam ---
const SiswaLayout = lazy(() => import('./siswa/components/layout/SiswaLayout.jsx'))
const DashboardSiswa = lazy(() => import('./pages/siswa/Dashboard.jsx'))
const KatalogSiswa = lazy(() => import('./pages/siswa/Katalog.jsx'))
const RiwayatSiswa = lazy(() => import('./pages/siswa/Riwayat.jsx'))
const ProfileSiswa = lazy(() => import('./pages/siswa/Profile.jsx'))

/**
 * Komponen fallback loader saat bundle halaman sedang diunduh (Lazy Loading)
 */
function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center font-poppins text-sm text-slate-500">
      Memuat...
    </div>
  )
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.25, ease: 'easeIn' } },
}

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <Suspense fallback={<Fallback />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* ===================================================
                1. Rute Publik
               =================================================== */}
            <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />

          {/* ===================================================
              2. Rute Admin Perpustakaan
             =================================================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['PUSTAKAWAN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardAdmin />} />
            <Route path="buku" element={<BukuAdmin />} />
            <Route path="anggota" element={<AnggotaAdmin />} />
            <Route path="sirkulasi" element={<SirkulasiAdmin />} />
            <Route path="denda" element={<DendaAdmin />} />
            <Route path="laporan" element={<LaporanAdmin />} />
            <Route path="pengaturan" element={<PengaturanAdmin />} />
          </Route>

          {/* ===================================================
              3. Rute Siswa / Peminjam
             =================================================== */}
          <Route
            path="/siswa"
            element={
              <ProtectedRoute allowedRoles={['SISWA']}>
                <SiswaLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardSiswa />} />
            <Route path="katalog" element={<KatalogSiswa />} />
            <Route path="riwayat" element={<RiwayatSiswa />} />
            <Route path="profil" element={<ProfileSiswa />} />
          </Route>

          {/* ===================================================
              4. Fallback jika rute tidak ditemukan (404 redirect)
             =================================================== */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  </AuthProvider>
)
}
