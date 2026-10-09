/**
 * ==============================================================================
 * Halaman: Katalog Buku Siswa
 * Deskripsi: Halaman pencarian dan eksplorasi koleksi buku dengan filter kategori
 *            serta modal detail spesifikasi buku.
 * ==============================================================================
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from '../../siswa/components/BookCard';
import CatalogHeader from '../../siswa/components/katalog/CatalogHeader';
import BookDetailModal from '../../siswa/components/katalog/BookDetailModal';
import EbookReaderModal from '../../siswa/components/reader/EbookReaderModal';
import { BookService, CategoryService } from '../../services/api';
import { getStoredEbooks } from '../../utils/ebookStore';
import { useAuth } from '../../lib/auth';

export default function KatalogSiswa() {
  const { user } = useAuth();
  const [bukuList, setBukuList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [bukuTerpilih, setBukuTerpilih] = useState(null);
  const [readingEbook, setReadingEbook] = useState(null);

  useEffect(() => {
    let mounted = true;
    CategoryService.getAll({ limit: 100 })
      .then((res) => {
        if (mounted && res.data?.data) setCategories(res.data.data);
      })
      .catch(() => {});

    const loadBuku = async () => {
      let combined = [];
      try {
        const res = await BookService.search({ limit: 100 });
        if (mounted && res.data?.data) {
          combined = res.data.data.map(b => ({
            id: b.id,
            isEbook: false,
            judul: b.title,
            penulis: b.authors?.map(a => a.name).join(', ') || '-',
            kategori: b.category?.name || 'Lainnya',
            sampul: b.coverUrl || null,
            tersedia: b.copyCount > 0,
            stok: b.copyCount || 0,
            isbn: b.isbn || '-',
            penerbit: b.publisher || '-',
            tahun: b.publicationYear || '-',
            rak: '-',
            deskripsi: b.description || 'Belum ada deskripsi.'
          }));
        }
      } catch (err) {
        console.error("Gagal memuat katalog dari API:", err);
      }

      // Merge stored e-books
      const ebooks = getStoredEbooks().map(eb => ({
        id: eb.id,
        isEbook: true,
        judul: eb.title,
        penulis: eb.author,
        kategori: eb.category || 'Digital',
        sampul: eb.coverUrl || null,
        tersedia: true,
        stok: 99,
        isbn: eb.isbn || '-',
        penerbit: 'SIMPUS E-Library',
        tahun: new Date().getFullYear(),
        rak: 'E-Book Online',
        deskripsi: eb.description || 'Koleksi buku digital resmi SIMPUS.',
        fileUrl: eb.fileUrl,
      }));

      if (mounted) {
        setBukuList([...combined, ...ebooks]);
      }
    };
    loadBuku();
    return () => { mounted = false; };
  }, []);

  const filteredBuku = useMemo(() => {
    return bukuList.filter((buku) => {
      const cocokKategori =
        kategoriFilter === '' || buku.kategori === kategoriFilter;
      const query = searchQuery.toLowerCase().trim();
      const cocokPencarian =
        !query ||
        buku.judul.toLowerCase().includes(query) ||
        buku.penulis.toLowerCase().includes(query) ||
        buku.rak.toLowerCase().includes(query);
      return cocokKategori && cocokPencarian;
    });
  }, [bukuList, searchQuery, kategoriFilter]);

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* Komponen Header Pencarian & Filter */}
      <CatalogHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        kategoriFilter={kategoriFilter}
        setKategoriFilter={setKategoriFilter}
        categories={categories}
      />

      {/* Grid Kartu Koleksi Buku */}
      {filteredBuku.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence>
            {filteredBuku.map((buku) => (
              <motion.div
                key={buku.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <BookCard
                  buku={buku}
                  onDetailClick={(dataBuku) => setBukuTerpilih(dataBuku)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Kondisi jika pencarian buku tidak ditemukan */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center p-6"
        >
          <div className="w-16 h-16 bg-light-blue rounded-full flex items-center justify-center text-3xl mb-3">
            📚
          </div>
          <h3 className="text-lg font-bold text-dark-navy">Buku tidak ditemukan</h3>
          <p className="text-xs sm:text-sm text-text-sekunder mt-1 max-w-sm">
            Coba gunakan kata kunci lain atau ubah kategori pilihanmu.
          </p>
        </motion.div>
      )}

      {/* Modal Detail Buku Pop-up */}
      {bukuTerpilih && (
        <BookDetailModal
          buku={bukuTerpilih}
          student={user}
          onClose={() => setBukuTerpilih(null)}
          onOpenReader={(ebk) => {
            setBukuTerpilih(null);
            setReadingEbook(ebk);
          }}
        />
      )}

      {/* Secure DRM E-Book Reader Modal */}
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
