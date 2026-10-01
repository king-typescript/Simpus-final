import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' },
  withCredentials: true // Cookie HTTP-Only otomatis disertakan
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Tangani unauthorized secara global (opsional: arahkan ke /login)
    if (err.response?.status === 401) {
      localStorage.removeItem('simpus_user')
    }
    return Promise.reject(err)
  }
)

export default api

