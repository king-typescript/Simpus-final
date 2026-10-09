import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Tablet, ArrowRight } from 'lucide-react'
import { BookService, CategoryService } from '../services/api.js'
import BookCard from './BookCard.jsx'
import { useAuth } from '../lib/auth.jsx'

const FALLBACK_PHYSICAL_BOOKS = []

export default function PopularBooks() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [dbCategories, setDbCategories] = useState([])
  const [physicalBooks, setPhysicalBooks] = useState([])
  const [eBooks, setEBooks] = useState([])
  const [totalPhysicalCount, setTotalPhysicalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleExternalSearch = (e) => setQuery(e.detail || '')
    window.addEventListener('simpus-search', handleExternalSearch)
    return () => window.removeEventListener('simpus-search', handleExternalSearch)
  }, [])

  useEffect(() => {
    let mounted = true
    CategoryService.getAll({ limit: 100 }).then((res) => {
      if (mounted && res.data?.data) setDbCategories(res.data.data)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchBooks = async () => {
      setLoading(true)
      try {
        const isFiltered = Boolean(query || category)
        const params = { limit: 20, status: 'TERSEDIA', sort: 'popular' }
        if (query) params.search = query
        if (category) params.categoryId = category

        const res = isFiltered
          ? await BookService.search(params)
          : await BookService.getPopular()

        if (isMounted) {
          const raw = res.data?.data || res.data || []
          const paginationTotal = res.data?.pagination?.total ?? (Array.isArray(raw) ? raw.length : 0)
          setTotalPhysicalCount(paginationTotal)

          const mapped = Array.isArray(raw) ? raw.map((b) => ({
            id: b.id,
            isEbook: Boolean(b.isEbook),
            title: b.title,
            category: typeof b.category === 'object' ? b.category?.name : b.category,
            categoryId: b.category?.id || b.categoryId || '',
            author: b.authors?.map((a) => a.name).join(', ') || b.author || '-',
            publisher: b.publisher || '-',
            year: b.publicationYear || b.year || '-',
            publicationYear: b.publicationYear || null,
            pageCount: b.pageCount || null,
            isbn: b.isbn || '-',
            shelf: b.shelf || '-',
            copies: b.isEbook ? 99 : (b.copyCount ?? b.copies ?? 0),
            stock: b.isEbook ? 99 : (b.copyCount ?? b.copies ?? 0),
            description: b.description || 'Belum ada deskripsi untuk buku ini.',
            cover: b.coverUrl || b.cover || null,
            fileUrl: b.fileUrl || null,
            color: b.isEbook ? '#F3E8FF' : '#E3EEFB',
            accent: b.isEbook ? '#7E22CE' : '#1D5FAE',
          })) : []

          const onlyPhysical = mapped.filter((b) => !b.isEbook)
          const onlyEbooks = mapped.filter((b) => b.isEbook)

          setPhysicalBooks(onlyPhysical)
          setEBooks(onlyEbooks)
        }
      } catch (err) {
        if (isMounted) {
          setPhysicalBooks([])
          setTotalPhysicalCount(0)
          setEBooks([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchBooks()
  }, [query, category])

  const filteredPhysical = useMemo(() => physicalBooks, [physicalBooks])

  // Batasi hanya 4 buku fisik dan 4 e-book untuk tampilan Landing Page terbaik
  const displayedPhysical = useMemo(() => filteredPhysical.slice(0, 4), [filteredPhysical])
  const displayedEBooks = useMemo(() => {
    if (!query) return eBooks.slice(0, 4)
    const q = query.toLowerCase()
    return eBooks.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)).slice(0, 4)
  }, [eBooks, query])

  const hasPhysical = displayedPhysical.length > 0
  const hasEBooks = displayedEBooks.length > 0

  // URL navigasi katalog lengkap: jika sudah login siswa arahkan ke /siswa/katalog, jika belum ke /login
  const katalogLink = user?.role === 'SISWA' ? '/siswa/katalog' : user?.role === 'PUSTAKAWAN' ? '/admin/buku' : '/login'

  return (
    <section id="katalog" className="scroll-mt-20 bg-gradient-to-b from-brand-soft/40 via-white to-white py-12 sm:py-16 lg:py-20 font-poppins">
      <div className="container-page space-y-12 lg:space-y-16">
        {/* Header & Search Bar */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end lg:gap-6">
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl lg:text-4xl">
              Jelajahi Koleksi
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-copy sm:text-base">
              Temukan buku fisik dan e-book digital pilihan untuk mendukung pembelajaran Anda.
            </p>
          </div>

          {/* Search & Filter di Sebelah Kanan */}
          <div className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full sm:p-1.5 lg:w-[480px] lg:shrink-0">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Search className="ml-2 h-4 w-4 shrink-0 text-slate-copy sm:ml-3" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari judul atau penulis..."
                enterKeyHint="search"
                autoComplete="off"
                className="min-w-0 w-full bg-transparent px-1 py-2.5 text-[16px] text-navy-900 placeholder:text-slate-copy focus:outline-none sm:py-2 sm:text-sm"
              />
            </div>
            <span className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-[44px] w-full shrink-0 touch-manipulation rounded-xl bg-slate-50 px-3 py-2 text-[16px] font-semibold text-navy-900 focus:outline-none sm:w-auto sm:bg-transparent sm:text-sm"
            >
              <option value="">Semua Kategori</option>
              {dbCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-12">
            {[1, 2].map((group) => (
              <div key={group} className="space-y-4">
                <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !hasPhysical && !hasEBooks ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Buku tidak ditemukan</h3>
            <p className="mt-2 text-sm text-slate-copy">Coba kata kunci atau kategori yang berbeda.</p>
          </div>
        ) : (
          <>
            {/* Section: Buku Fisik (Maksimal 4 item) */}
            {hasPhysical && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy-900 sm:text-2xl">📖 Koleksi Buku Fisik</h3>
                      <p className="text-xs text-slate-copy sm:text-sm">Buku fisik terpopuler yang dapat dipinjam langsung di perpustakaan</p>
                    </div>
                  </div>

                  <Link
                    to={katalogLink}
                    className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    <span>Lihat Semua ({totalPhysicalCount || filteredPhysical.length}+ Judul)</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                  {displayedPhysical.map((book) => (
                    <BookCard key={book.id} book={book} type="physical" />
                  ))}
                </div>
              </div>
            )}

            {/* Divider Antar Grup */}
            {hasPhysical && hasEBooks && (
              <div className="relative my-4 h-px bg-slate-200/80" />
            )}

            {/* Section: E-Book Digital (Maksimal 4 item) */}
            {hasEBooks && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 shadow-sm">
                      <Tablet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy-900 sm:text-2xl">📱 Koleksi E-Book Digital</h3>
                      <p className="text-xs text-slate-copy sm:text-sm">Buku digital interaktif dengan pembaca DRM online langsung</p>
                    </div>
                  </div>

                  <Link
                    to={katalogLink}
                    className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-700 transition"
                  >
                    <span>Lihat Semua E-Book ({eBooks.length}+ Koleksi)</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                  {displayedEBooks.map((book) => (
                    <BookCard key={book.id} book={book} type="ebook" />
                  ))}
                </div>
              </div>
            )}

            {/* CTA Banner: Lihat Semua Katalog Lengkap */}
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-lg sm:text-xl font-extrabold tracking-wide">
                  Ingin Mencari Lebih Banyak Koleksi Buku & E-Book?
                </h4>
                <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                  Jelajahi seluruh koleksi perpustakaan SIMPUS SATAK secara lengkap dengan pencarian kategori dan ketersediaan stok aktual.
                </p>
              </div>

              <Link
                to={katalogLink}
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-blue-700 shadow-lg transition duration-200 hover:bg-blue-50 active:scale-95"
              >
                <span>Buka Katalog Lengkap</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
