import api, { saveAuthToken, clearAuthToken } from '../lib/api.js'

export const BookService = {
  getPopular: () => api.get('/buku', { params: { limit: 8, status: 'TERSEDIA' } }),
  search: (params) => api.get('/buku', { params }),
  getById: (id) => api.get(`/buku/${id}`),
  create: (data) => api.post('/buku', data),
  update: (id, data) => api.patch(`/buku/${id}`, data),
  delete: (id) => api.delete(`/buku/${id}`),
}

export const CategoryService = {
  getAll: (params) => api.get('/kategori', { params })
}

export const AuthService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updatePassword: (data) => api.patch('/auth/change-password', data),
  getDashboard: () => api.get('/dashboard'),
}

export const DashboardService = {
  get: () => api.get('/dashboard'),
}

export const MemberService = {
  getAll: (params) => api.get('/anggota', { params }),
  getById: (id) => api.get(`/anggota/${id}`),
  create: (data) => api.post('/anggota', data),
  update: (id, data) => api.patch(`/anggota/${id}`, data),
  delete: (id) => api.delete(`/anggota/${id}`),
}

export const LoanService = {
  getActive: () => api.get('/sirkulasi/pinjaman-aktif'),
  borrow: (data) => api.post('/sirkulasi/pinjam', data),
  returnBook: (data) => api.post('/sirkulasi/kembali', data),
  extend: (data) => api.post('/sirkulasi/perpanjang', data),
}

export const FineService = {
  getAll: (params) => api.get('/denda', { params }),
  pay: (id, data) => api.post(`/denda/${id}`, data),
}

export const LibrarySettingService = {
  get: () => api.get('/pengaturan/perpustakaan'),
  update: (data) => api.patch('/pengaturan/perpustakaan', data),
}

export { saveAuthToken, clearAuthToken }
export default api
