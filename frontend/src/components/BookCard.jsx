import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  X,
  BookOpen,
  User,
  Building2,
  Calendar,
  Barcode,
  FileText,
  Languages,
  Package,
  MapPin,
  Info,
  Lock,
  LogIn,
  AlertCircle,
  Tablet
} from 'lucide-react'
import { useAuth } from '../lib/auth'

function getField(source, keys, fallback = '-') {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return fallback
}

const BookDetailModal = memo(function BookDetailModal({ book, onClose, type = 'physical' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const bgColor = book.color ?? (type === 'ebook' ? '#F3E8FF' : '#E3EEFB')
  const accentColor = book.accent ?? (type === 'ebook' ? '#7E22CE' : '#1D5FAE')
  const isEbook = type === 'ebook' || Boolean(book.isEbook)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey, { passive: true })
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const rows = useMemo(() => [
    { icon: User, label: 'Penulis', value: getField(book, ['author', 'penulis']) },
    { icon: Building2, label: 'Penerbit', value: getField(book, ['publisher', 'penerbit']) },
    { icon: Calendar, label: 'Tahun Terbit', value: getField(book, ['publicationYear', 'year', 'tahun', 'published_year']) },
    { icon: Barcode, label: 'ISBN', value: getField(book, ['isbn', 'ISBN']) },
    ...(!isEbook ? [
      { icon: FileText, label: 'Halaman', value: getField(book, ['pageCount', 'pages', 'halaman']) },
    ] : []),
    { icon: Package, label: isEbook ? 'Ketersediaan' : 'Stok Fisik', value: isEbook ? 'Tersedia (Digital)' : getField(book, ['stock', 'stok', 'copies', 'copyCount'], '0') },
    ...(!isEbook ? [{ icon: MapPin, label: 'Lokasi Rak', value: getField(book, ['shelf', 'rak', 'location']) }] : []),
    { icon: Info, label: 'Format', value: isEbook ? 'E-Book PDF DRM' : 'Buku Cetak Fisik' },
  ], [book, isEbook])

  const description = useMemo(
    () => getField(book, ['description', 'deskripsi', 'synopsis'], 'Belum ada deskripsi untuk buku ini.'),
    [book]
  )

  const handleActionClick = useCallback(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role === 'SISWA') {
      navigate('/siswa/katalog')
    } else if (user.role === 'PUSTAKAWAN') {
      navigate('/admin/buku')
    }
  }, [user, navigate])

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4 md:p-6"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail ${book.title}`}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: bgColor }}
        className="flex max-h-[92svh] max-h-[92dvh] w-full max-w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:mx-auto sm:max-w-lg sm:rounded-3xl md:max-w-2xl lg:max-w-3xl"
      >
        {/* Cover Area */}
        <div className="relative flex h-52 shrink-0 items-center justify-center overflow-hidden py-4 sm:h-64 md:h-72" style={{ backgroundColor: bgColor }}>
          {book.cover ? (
            <>
              <img src={book.cover} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl" />
              <img
                src={book.cover}
                alt={`Sampul ${book.title}`}
                className="relative z-10 max-h-[170px] w-auto max-w-[70%] rounded-xl object-contain object-center shadow-2xl sm:max-h-[210px] sm:max-w-[50%] md:max-h-[235px]"
                loading="eager"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              {isEbook ? (
                <Tablet className="h-12 w-12 opacity-35 sm:h-16 sm:w-16" style={{ color: accentColor }} />
              ) : (
                <BookMarked className="h-12 w-12 opacity-35 sm:h-16 sm:w-16" style={{ color: accentColor }} />
              )}
              <span className="mt-2 line-clamp-2 text-center text-base font-extrabold sm:text-lg" style={{ color: accentColor }}>
                {book.title}
              </span>
            </div>
          )}

          {isEbook && (
            <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-xl bg-purple-700/90 text-white px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg">
              <Tablet className="h-3.5 w-3.5" />
              E-Book Digital
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className="absolute right-3.5 top-3.5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all duration-200 hover:rotate-90 hover:bg-black/50 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-5 sm:p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isEbook ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isEbook ? <Tablet className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
              {book.category || (isEbook ? 'Digital' : 'Umum')}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {isEbook ? 'Online Reader' : 'Buku Fisik'}
            </span>
          </div>

          <h3 className="mt-3 break-words text-xl font-extrabold text-navy-900 sm:text-2xl md:text-3xl">{book.title}</h3>
          <p className="mt-1 text-xs text-slate-copy sm:text-sm">Oleh: <span className="font-semibold text-navy-900">{book.author || book.penulis || '-'}</span></p>

          <dl className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/70 shadow-sm">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-3 px-4 py-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-slate-copy">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isEbook ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <dt className="font-medium">{label}</dt>
                </div>
                <dd className="break-words font-semibold text-navy-900 text-right">{String(value)}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 space-y-1.5">
            <p className="text-sm font-bold text-navy-900 sm:text-base">Sinopsis & Deskripsi</p>
            <p className="break-words text-xs leading-relaxed text-slate-copy sm:text-sm">{description}</p>
          </div>

          {/* Info Banner */}
          {isEbook ? (
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-purple-50 p-3.5 border border-purple-100/80">
              <Lock className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-800 leading-relaxed">
                <p className="font-bold">Keamanan DRM Terlindungi</p>
                <p className="mt-0.5 text-purple-700/90">E-Book ini dilengkapi proteksi anti-screenshot dan watermark dinamis identitas peminjam. {user ? 'Dapat langsung dibaca setelah meminjam.' : 'Silakan login sebagai siswa untuk membaca.'}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-blue-50 p-3.5 border border-blue-100/80">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 leading-relaxed">
                <p className="font-bold">Informasi Peminjaman Fisik</p>
                <p className="mt-0.5 text-blue-700/90">Buku fisik hanya dapat dipinjam langsung ke pustakawan di meja sirkulasi perpustakaan sekolah dengan menunjukkan NIS atau kartu anggota.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 sm:flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Tutup
            </button>

            <button
              type="button"
              onClick={handleActionClick}
              className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-95 sm:flex-1 ${
                isEbook
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {!user ? (
                <>
                  <LogIn className="h-4 w-4" />
                  Login untuk {isEbook ? 'Membaca' : 'Meminjam'}
                </>
              ) : isEbook ? (
                <>
                  <Tablet className="h-4 w-4" />
                  Buka E-Book di Katalog
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Cek Lokasi di Perpustakaan
                </>
              )}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
})

function BookCard({ book, type = 'physical' }) {
  const [open, setOpen] = useState(false)
  const isEbook = type === 'ebook' || Boolean(book.isEbook)
  const bgColor = book.color ?? (isEbook ? '#F3E8FF' : '#E3EEFB')
  const accentColor = book.accent ?? (isEbook ? '#7E22CE' : '#1D5FAE')

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group flex h-full min-w-0 flex-col rounded-3xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300"
      >
        <div className="relative mb-3.5 flex h-40 sm:h-44 items-center justify-center overflow-hidden rounded-2xl" style={{ backgroundColor: bgColor }}>
          {book.cover ? (
            <img
              src={book.cover}
              alt={`Sampul ${book.title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              {isEbook ? (
                <Tablet className="h-10 w-10 opacity-30 sm:h-12 sm:w-12" style={{ color: accentColor }} />
              ) : (
                <BookMarked className="h-10 w-10 opacity-30 sm:h-12 sm:w-12" style={{ color: accentColor }} />
              )}
              <span className="mt-1 line-clamp-2 text-xs font-bold leading-tight" style={{ color: accentColor }}>
                {book.title}
              </span>
            </div>
          )}

          {isEbook ? (
            <span className="absolute top-2.5 left-2.5 rounded-lg bg-purple-700/90 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1">
              <Tablet className="h-3 w-3" />
              E-BOOK
            </span>
          ) : (
            <span className="absolute top-2.5 left-2.5 rounded-lg bg-blue-700/90 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              FISIK
            </span>
          )}

          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/40 text-white px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
            {isEbook ? 'Digital PDF' : `Stok: ${book.copies ?? book.stock ?? 0}`}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className={`inline-block text-[11px] font-bold uppercase tracking-wider ${
              isEbook ? 'text-purple-600' : 'text-blue-600'
            }`}>
              {book.category || (isEbook ? 'Digital' : 'Umum')}
            </span>
            <h4 className="line-clamp-2 break-words text-sm sm:text-base font-bold text-navy-900 mt-0.5 group-hover:text-blue-600 transition-colors">
              {book.title}
            </h4>
            <p className="mt-1 line-clamp-1 break-words text-xs text-slate-copy">
              {book.author || book.penulis || 'Penulis Tidak Diketahui'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className={`mt-4 inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 ${
              isEbook
                ? 'border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-600 hover:text-white hover:border-purple-600'
                : 'border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-600 hover:text-white hover:border-blue-600'
            }`}
          >
            Lihat Detail & {isEbook ? 'Baca' : 'Pinjam'}
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </motion.article>

      <AnimatePresence>
        {open && <BookDetailModal book={book} onClose={handleClose} type={type} />}
      </AnimatePresence>
    </>
  )
}

export default memo(BookCard)
