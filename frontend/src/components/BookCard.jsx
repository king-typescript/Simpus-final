import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, BookMarked, X, BookOpen, User, Building2, Calendar, Barcode, FileText, Languages, Package, MapPin, Info } from 'lucide-react'

function getField(source, keys, fallback = '-') {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return fallback
}

const BookDetailModal = memo(function BookDetailModal({ book, onClose }) {
  const bgColor = book.color ?? '#E3EEFB'
  const accentColor = book.accent ?? '#1D5FAE'

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
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
    { icon: Calendar, label: 'Tahun Terbit', value: getField(book, ['year', 'tahun', 'published_year']) },
    { icon: Barcode, label: 'ISBN', value: getField(book, ['isbn', 'ISBN']) },
    { icon: FileText, label: 'Halaman', value: getField(book, ['pages', 'halaman']) },
    { icon: Languages, label: 'Bahasa', value: getField(book, ['language', 'bahasa']) },
    { icon: Package, label: 'Stok', value: getField(book, ['stock', 'stok', 'copies']) },
    { icon: MapPin, label: 'Lokasi Rak', value: getField(book, ['shelf', 'rak', 'location']) },
    { icon: Info, label: 'Status', value: getField(book, ['status'], 'Tersedia') },
  ], [book])

  const description = useMemo(
    () => getField(book, ['description', 'deskripsi', 'synopsis'], 'Belum ada deskripsi untuk buku ini.'),
    [book]
  )

        return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-navy-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4 md:p-6 landscape:items-center landscape:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detail ${book.title}`}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: bgColor }}
        className="flex max-h-[92svh] max-h-[92dvh] w-full max-w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:mx-auto sm:max-w-lg sm:rounded-3xl md:max-w-2xl lg:max-w-3xl landscape:max-h-[88svh] landscape:max-w-lg landscape:rounded-2xl"
      >
        <div className="relative flex h-56 shrink-0 items-center justify-center overflow-hidden py-5 sm:h-64 md:h-72 landscape:h-40 landscape:py-3" style={{ backgroundColor: bgColor }}>
          {book.cover ? (
            <>
              <img src={book.cover} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl" />
              <img
                src={book.cover}
                alt={`Sampul ${book.title}`}
                className="relative z-10 max-h-[176px] w-auto max-w-[70%] rounded-md object-contain object-center shadow-xl sm:max-h-[208px] sm:max-w-[50%] md:max-h-[232px] landscape:max-h-[128px]"
                loading="eager"
              />
            </>
          ) : (
            <>
              <BookMarked className="h-10 w-10 opacity-30" style={{ color: accentColor }} />
              <span className="absolute inset-x-6 bottom-4 text-center text-lg font-extrabold leading-tight" style={{ color: accentColor }}>{book.title}</span>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className="group/close absolute right-3 top-3 flex min-h-[44px] min-w-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-full bg-black/20 text-white transition-all duration-200 hover:rotate-90 hover:bg-[#0B78E3] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B78E3] active:scale-90"
          >
            <X className="h-5 w-5 transition-transform duration-200 group-hover/close:scale-110" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-5 [-webkit-overflow-scrolling:touch] sm:p-6 sm:pb-8 md:p-8 md:pb-10 landscape:p-4 landscape:pb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
            <BookOpen className="h-3.5 w-3.5" />
            {book.category}
          </span>
          <h3 className="mt-2 break-words text-xl font-extrabold text-navy-900 sm:text-2xl md:text-3xl">{book.title}</h3>
          <p className="mt-1 text-xs text-slate-copy sm:text-sm">ID: {book.id}</p>

          <dl className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/60">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 sm:py-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <dt className="w-24 shrink-0 text-xs font-semibold text-slate-copy sm:text-sm">{label}</dt>
                <dd className="min-w-0 flex-1 break-words text-right text-xs font-bold text-navy-900 sm:text-sm md:text-base">{String(value)}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-sm font-bold text-navy-900 sm:text-base">Deskripsi</p>
          <p className="mt-1 break-words text-sm leading-relaxed text-slate-copy sm:text-base">{description}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="group/back inline-flex min-h-[44px] w-full cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full border border-[#0B78E3] px-5 py-3 text-sm font-bold text-navy-900 transition-all duration-200 hover:-translate-x-0.5 hover:bg-[#0B78E3] hover:text-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-x-0 active:scale-[0.98] sm:flex-1 sm:py-2.5"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover/back:-translate-x-1" />
              Kembali
            </button>
            <button
              type="button"
              onClick={onClose}
              className="group/borrow inline-flex min-h-[44px] w-full cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full bg-[#0B78E3] px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-0 active:scale-[0.98] sm:flex-1 sm:py-2.5"
            >
              Pinjam Buku
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/borrow:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
})

function BookCard({ book }) {
  const [open, setOpen] = useState(false)
  const bgColor = book.color ?? '#E3EEFB'
  const accentColor = book.accent ?? '#1D5FAE'

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <article className="group flex h-full min-w-0 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
        <div className="relative mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl sm:h-40" style={{ backgroundColor: bgColor }}>
          {book.cover ? (
            <img src={book.cover} alt={`Sampul ${book.title}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <>
              <BookMarked className="h-7 w-7 opacity-30 sm:h-8 sm:w-8" style={{ color: accentColor }} />
              <span className="absolute inset-x-3 bottom-3 line-clamp-2 text-center text-sm font-extrabold leading-tight" style={{ color: accentColor }}>{book.title}</span>
            </>
          )}
        </div>
        <h4 className="line-clamp-2 break-words text-sm font-bold text-navy-900 sm:text-base">{book.title}</h4>
        <p className="mt-1 line-clamp-1 break-words text-xs text-slate-copy sm:text-sm">{book.category}</p>
        <button
          type="button"
          onClick={handleOpen}
          className="mt-4 inline-flex min-h-[44px] w-fit touch-manipulation items-center gap-1.5 rounded-full border border-brand px-4 py-2 text-xs font-semibold text-brand transition group-hover:bg-brand group-hover:text-white active:scale-95 sm:text-xs"
        >
          Lihat Detail
          <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </article>
      {open && <BookDetailModal book={book} onClose={handleClose} />}
    </>
  )
}

export default memo(BookCard)
