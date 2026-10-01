import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { BookService } from '../services/api.js'
import { popularBooks as fallbackBooks, CATEGORIES } from '../data/books.js'
import BookCard from './BookCard.jsx'

export default function PopularBooks() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Semua Kategori')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleExternalSearch = (e) => setQuery(e.detail || '')
    window.addEventListener('simpus-search', handleExternalSearch)
    return () => window.removeEventListener('simpus-search', handleExternalSearch)
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchBooks = async () => {
      setLoading(true)
      try {
        const params = {}
        if (query) params.search = query
        if (category !== 'Semua Kategori') params.category = category

        const res = query || category !== 'Semua Kategori'
          ? await BookService.search(params)
          : await BookService.getPopular()

        if (isMounted) {
          const raw = res.data?.data || res.data || []
          const mapped = Array.isArray(raw) && raw.length > 0 ? raw.map((b) => ({
            id: b.id,
            title: b.title,
            category: typeof b.category === 'object' ? b.category?.name : b.category,
            author: b.authors?.map((a) => a.name).join(', ') || b.author || '-',
            publisher: b.publisher || '-',
            year: b.publicationYear || b.year || '-',
            isbn: b.isbn || '-',
            copies: b.copyCount ?? b.copies ?? 0,
            description: b.description || 'Belum ada deskripsi untuk buku ini.',
            cover: b.coverUrl || b.cover || null,
            color: b.color || '#E3EEFB',
            accent: b.accent || '#1D5FAE',
          })) : fallbackBooks
          setBooks(mapped.length > 0 ? mapped : fallbackBooks)
        }
      } catch (err) {
        if (isMounted) {
          const filtered = fallbackBooks.filter((book) => {
            const matchesQuery = book.title.toLowerCase().includes(query.toLowerCase())
            const matchesCategory = category === 'Semua Kategori' || book.category === category
            return matchesQuery && matchesCategory
          })
          setBooks(filtered)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    const timer = setTimeout(fetchBooks, 300)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [query, category])

  return (
    <section id="katalog" className="scroll-mt-20 bg-brand-soft/60 py-12 sm:py-16">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end lg:gap-6">
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl lg:text-4xl">Buku Populer</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-copy sm:text-base">
              Buku-buku yang paling banyak dibaca dan dipinjam oleh pengunjung perpustakaan
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full sm:p-1.5 lg:w-[480px] lg:shrink-0">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Search className="ml-2 h-4 w-4 shrink-0 text-slate-copy sm:ml-3" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari judul buku..."
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
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center text-sm text-slate-copy sm:mt-10 sm:text-base">
            Buku tidak ditemukan. Coba kata kunci atau kategori lain.
          </div>
        )}
      </div>
    </section>
  )
}
