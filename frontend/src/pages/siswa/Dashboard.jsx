/**
 * ==============================================================================
 * Halaman: Dashboard Siswa
 * Deskripsi: Halaman utama bagi siswa yang menampilkan ringkasan informasi,
 *            kartu statistik, aksi cepat, pinjaman aktif, serta koleksi buku terbaru.
 * ==============================================================================
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import WelcomeBanner from '../../siswa/components/dashboard/WelcomeBanner';
import StatCard from '../../siswa/components/dashboard/StatCard';
import ActiveLoansCard from '../../siswa/components/dashboard/ActiveLoansCard';
import RecentReadCard from '../../siswa/components/dashboard/RecentReadCard';
import NewCollectionCard from '../../siswa/components/dashboard/NewCollectionCard';
import QuickActionsCard from '../../siswa/components/dashboard/QuickActionsCard';
import { AuthService } from '../../services/api';

// Konfigurasi animasi stagger untuk item dashboard
const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
};

export default function DashboardSiswa() {
  const [stats, setStats] = useState([
    { id: 'dipinjam', label: 'Sedang Dipinjam', nilai: '0', satuan: 'Buku', tipe: 'warning' },
    { id: 'selesai', label: 'Riwayat Pinjam', nilai: '0', satuan: 'Buku', tipe: 'success' },
    { id: 'denda', label: 'Tunggakan Denda', nilai: 'Rp 0', satuan: '', tipe: 'danger' }
  ]);
  const [activeLoans, setActiveLoans] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadDashboard = async () => {
      try {
        const res = await AuthService.me();
        if (mounted && res.data?.data) {
          const d = res.data.data;
          setStats([
            {
              id: 'dipinjam',
              label: 'Sedang Dipinjam',
              nilai: String(d.loans?.active ?? 0),
              satuan: 'Buku',
              tipe: 'warning',
            },
            {
              id: 'selesai',
              label: 'Riwayat Pinjam',
              nilai: String(d.recentLoans?.length ?? 0),
              satuan: 'Buku',
              tipe: 'success',
            },
            {
              id: 'denda',
              label: 'Tunggakan Denda',
              nilai: `Rp ${Number(d.fines?.unpaidAmount ?? 0).toLocaleString('id-ID')}`,
              satuan: '',
              tipe: 'danger',
            },
          ]);

          if (d.activeLoans) {
            const mapped = d.activeLoans.flatMap((loan) =>
              (loan.items || []).map((item) => ({
                id: item.id || item.copyId,
                judul: item.copy?.book?.title || 'Buku Perpustakaan',
                rak: 'Ruang Utama',
                kode: item.copy?.barcode || '-',
                jatuhTempo: loan.dueDate ? new Date(loan.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
                catatan: loan.daysLate > 0 ? `Terlambat ${loan.daysLate} hari` : 'Kembalikan tepat waktu',
              }))
            );
            setActiveLoans(mapped);
          }
        }
      } catch (err) {
        console.error('Gagal memuat dashboard siswa:', err);
      }
    };
    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Banner Ucapan Selamat Datang & Pengumuman */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={staggerItem}>
        <WelcomeBanner />
      </motion.div>

      {/* 2. Tombol Pintasan Aksi Cepat */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={staggerItem}>
        <QuickActionsCard />
      </motion.div>

      {/* 3. Kartu Statistik Peminjaman Siswa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {stats.map((stat, i) => (
          <motion.div key={stat.id} custom={i + 2} initial="hidden" animate="visible" variants={staggerItem}>
            <StatCard
              label={stat.label}
              nilai={stat.nilai}
              satuan={stat.satuan}
              tipe={stat.tipe}
            />
          </motion.div>
        ))}
      </div>

      {/* 4. Konten Utama: Buku Aktif Dipinjam & Rekomendasi Koleksi */}
      <motion.div custom={5} initial="hidden" animate="visible" variants={staggerItem}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          <ActiveLoansCard bukuList={activeLoans} />
          <div className="flex flex-col gap-4 sm:gap-5 h-full">
            <RecentReadCard />
            <NewCollectionCard />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
