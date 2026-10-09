import api, { saveAuthToken, clearAuthToken } from '../lib/api.js'
import apiCache from '../lib/cache.js'

export const BookService = {
  getPopular: async () => {
    const cacheKey = 'buku_popular'
    const cached = apiCache.get(cacheKey)
    if (cached) return cached
    const res = await api.get('/buku', { params: { limit: 4, status: 'TERSEDIA', sort: 'popular' } })
    apiCache.set(cacheKey, res, 60000)
    return res
  },
  search: (params) => api.get('/buku', { params }),
  getById: (id) => api.get(`/buku/${id}`),
  create: async (data) => {
    const res = await api.post('/buku', data)
    apiCache.invalidate('buku')
    apiCache.invalidate('dashboard')
    return res
  },
  update: async (id, data) => {
    const res = await api.patch(`/buku/${id}`, data)
    apiCache.invalidate('buku')
    apiCache.invalidate('dashboard')
    return res
  },
  delete: async (id) => {
    const res = await api.delete(`/buku/${id}`)
    apiCache.invalidate('buku')
    apiCache.invalidate('dashboard')
    return res
  },
}

export const CategoryService = {
  getAll: (params) => api.get('/kategori', { params }),
  getById: (id) => api.get(`/kategori/${id}`),
  create: async (data) => {
    const res = await api.post('/kategori', data)
    apiCache.invalidate('kategori')
    apiCache.invalidate('buku')
    return res
  },
  update: async (id, data) => {
    const res = await api.patch(`/kategori/${id}`, data)
    apiCache.invalidate('kategori')
    apiCache.invalidate('buku')
    return res
  },
  delete: async (id) => {
    const res = await api.delete(`/kategori/${id}`)
    apiCache.invalidate('kategori')
    apiCache.invalidate('buku')
    return res
  },
}

export const ClassService = {
  getAll: (params) => api.get('/kelas', { params }),
  getById: (id) => api.get(`/kelas/${id}`),
  create: async (data) => {
    const res = await api.post('/kelas', data)
    apiCache.invalidate('kelas')
    return res
  },
  update: async (id, data) => {
    const res = await api.patch(`/kelas/${id}`, data)
    apiCache.invalidate('kelas')
    return res
  },
  delete: async (id) => {
    const res = await api.delete(`/kelas/${id}`)
    apiCache.invalidate('kelas')
    return res
  },
}

export const UploadService = {
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export const AuthService = {
  login: (credentials) => {
    apiCache.clear()
    return api.post('/auth/login', credentials)
  },
  logout: () => {
    apiCache.clear()
    return api.post('/auth/logout')
  },
  me: () => api.get('/auth/me'),
  updatePassword: (data) => api.patch('/auth/change-password', data),
  getDashboard: () => api.get('/dashboard'),
}

export const DashboardService = {
  getCached: () => apiCache.get('dashboard'),
  get: async (force = false) => {
    if (!force) {
      const cached = apiCache.get('dashboard')
      if (cached) return cached
    }
    const res = await api.get('/dashboard')
    apiCache.set('dashboard', res, 60000)
    return res
  },
  invalidate: () => apiCache.invalidate('dashboard'),
}

export const MemberService = {
  getAll: (params) => api.get('/anggota', { params }),
  getById: (id) => api.get(`/anggota/${id}`),
  create: async (data) => {
    const res = await api.post('/anggota', data)
    apiCache.invalidate('anggota')
    apiCache.invalidate('dashboard')
    return res
  },
  update: async (id, data) => {
    const res = await api.patch(`/anggota/${id}`, data)
    apiCache.invalidate('anggota')
    apiCache.invalidate('dashboard')
    return res
  },
  delete: async (id) => {
    const res = await api.delete(`/anggota/${id}`)
    apiCache.invalidate('anggota')
    apiCache.invalidate('dashboard')
    return res
  },
}

export const LoanService = {
  getActive: () => api.get('/sirkulasi/pinjaman-aktif'),
  borrow: async (data) => {
    const res = await api.post('/sirkulasi/pinjam', data)
    apiCache.invalidate('sirkulasi')
    apiCache.invalidate('dashboard')
    apiCache.invalidate('buku')
    return res
  },
  returnBook: async (data) => {
    const res = await api.post('/sirkulasi/kembali', data)
    apiCache.invalidate('sirkulasi')
    apiCache.invalidate('dashboard')
    apiCache.invalidate('buku')
    return res
  },
  extend: async (data) => {
    const res = await api.post('/sirkulasi/perpanjang', data)
    apiCache.invalidate('sirkulasi')
    apiCache.invalidate('dashboard')
    return res
  },
}

export const FineService = {
  getAll: (params) => api.get('/denda', { params }),
  pay: async (id, data) => {
    const res = await api.post(`/denda/${id}`, data)
    apiCache.invalidate('denda')
    apiCache.invalidate('dashboard')
    return res
  },
}

export const LibrarySettingService = {
  get: () => api.get('/pengaturan/perpustakaan'),
  update: (data) => api.patch('/pengaturan/perpustakaan', data),
}

export { saveAuthToken, clearAuthToken, apiCache }
export default api
