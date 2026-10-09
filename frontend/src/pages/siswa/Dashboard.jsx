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
import EbookReaderModal from '../../siswa/components/reader/EbookReaderModal';
import { DashboardService } from '../../services/api';
import { useAuth } from '../../lib/auth';
import { getActiveEbookLoans } from '../../utils/ebookStore';

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
};

function formatSiswaStats(d, eLoansCount = 0) {
  return [
    {
      id: 'dipinjam',
      label: 'Sedang Dipinjam',
      nilai: String((d?.loans?.active ?? 0) + eLoansCount),
      satuan: 'Buku',
      tipe: 'warning',
    },
    {
      id: 'selesai',
      label: 'Riwayat Pinjam',
      nilai: String(d?.recentLoans?.length ?? 0),
      satuan: 'Buku',
      tipe: 'success',
    },
    {
      id: 'denda',
      label: 'Tunggakan Denda',
      nilai: `Rp ${Number(d?.fines?.unpaidAmount ?? 0).toLocaleString('id-ID')}`,
      satuan: '',
      tipe: 'danger',
    },
  ];
}

function formatActiveLoans(d) {
  if (!d?.activeLoans) return [];
  return d.activeLoans.flatMap((loan) =>
    (loan.items || []).map((item) => ({
      id: item.id || item.copyId,
      judul: item.copy?.book?.title || 'Buku Perpustakaan',
      rak: 'Ruang Utama',
      kode: item.copy?.barcode || '-',
      jatuhTempo: loan.dueDate ? new Date(loan.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
      catatan: loan.daysLate > 0 ? `Terlambat ${loan.daysLate} hari` : 'Kembalikan tepat waktu',
    }))
  );
}

export default function DashboardSiswa() {
  const { user } = useAuth();
  const cachedResponse = DashboardService.getCached();
  const cachedData = cachedResponse?.data?.data;

  const initialELoans = getActiveEbookLoans(user?.id || 'siswa-demo');
  const [ebookLoans, setEbookLoans] = useState(initialELoans);
  const [stats, setStats] = useState(() => formatSiswaStats(cachedData, initialELoans.length));
  const [activeLoans, setActiveLoans] = useState(() => formatActiveLoans(cachedData));
  const [readingEbook, setReadingEbook] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadDashboard = async () => {
      try {
        const res = await DashboardService.get(!cachedData);
        if (mounted && res.data?.data) {
          const d = res.data.data;
          const eLoans = getActiveEbookLoans(user?.id || 'siswa-demo');
          if (mounted) {
            setEbookLoans(eLoans);
            setStats(formatSiswaStats(d, eLoans.length));
            setActiveLoans(formatActiveLoans(d));
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
  }, [cachedData, user?.id]);

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
          <ActiveLoansCard
            bukuList={activeLoans}
            ebookLoans={ebookLoans}
            onReadEbook={(ebk) => setReadingEbook(ebk)}
          />
          <div className="flex flex-col gap-4 sm:gap-5 h-full">
            <RecentReadCard />
            <NewCollectionCard />
          </div>
        </div>
      </motion.div>

      {/* 5. DRM Secure E-Book Reader Modal */}
      {readingEbook && (
        <EbookReaderModal
          ebook={readingEbook}
          student={user}
          onClose={() => setReadingEbook(null)}
        />
      )}
    </div>
  );
}
