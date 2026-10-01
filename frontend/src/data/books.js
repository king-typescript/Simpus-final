// Data contoh untuk pratinjau tampilan (Buku Populer).
// Pada implementasi nyata, data ini diganti dengan hasil fetch dari
// backend Laravel: GET /api/books/popular (lihat src/services/api.js)
import atomicHabitsCover from '../assets/image/buku/anatomic habits.jpeg'
import filosofiTerasCover from '../assets/image/buku/filosofi teras.jpg'

export const CATEGORIES = [
  'Semua Kategori',
  'Pengembangan Diri',
  'Filsafat',
  'Sastra',
  'Teknologi Informasi',
  'Ekonomi & Bisnis',
  'Kesehatan',
  'Sejarah',
  'Matematika',
]

export const popularBooks = [
  {
    id: 1,
    title: 'Atomic Habits',
    category: 'Pengembangan Diri',
    color: '#1E2A4A',
    accent: '#E7B84B',
    cover: atomicHabitsCover,
  },
  {
    id: 2,
    title: 'Filosofi Teras',
    category: 'Filsafat',
    color: '#7FB6B0',
    accent: '#F4C542',
    cover: filosofiTerasCover,
  },
  {
    id: 3,
    title: 'Laut Bercerita',
    category: 'Sastra',
    color: '#1B4F72',
    accent: '#EAF2FB',
  },
  {
    id: 4,
    title: 'Pemrograman Python',
    category: 'Teknologi Informasi',
    color: '#16213E',
    accent: '#F2C94C',
  },
  {
    id: 5,
    title: 'Manajemen',
    category: 'Ekonomi & Bisnis',
    color: '#1D3557',
    accent: '#E63946',
  },
  {
    id: 6,
    title: 'Keperawatan Dasar',
    category: 'Kesehatan',
    color: '#4E9E97',
    accent: '#FFFFFF',
  },
  {
    id: 7,
    title: 'Sejarah Indonesia',
    category: 'Sejarah',
    color: '#8C5A34',
    accent: '#F1E3C8',
  },
  {
    id: 8,
    title: 'Matematika Dasar',
    category: 'Matematika',
    color: '#0F3D5C',
    accent: '#7FDBDA',
  },
]
