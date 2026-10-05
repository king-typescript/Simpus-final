import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthService, saveAuthToken, clearAuthToken } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('simpus_user')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem('simpus_token')

    if (!token && !user) {
      setLoading(false)
      return
    }

    AuthService.me()
      .then((res) => {
        if (!mounted) return
        const d = res.data
        if (d?.role) {
          const userObj = d.role === 'SISWA'
            ? { role: d.role, ...(d.student || {}), username: d.user?.username || '' }
            : { role: d.role, name: d.user?.name || 'Administrator Perpustakaan', username: d.user?.username || '' }
          setUser((prev) => {
            const merged = prev ? { ...prev, ...userObj } : userObj
            localStorage.setItem('simpus_user', JSON.stringify(merged))
            return merged
          })
        }
      })
      .catch((err) => {
        if (!mounted) return
        // Hanya bersihkan sesi jika server secara eksplisit mengembalikan 401 (Unauthorized)
        if (err?.response?.status === 401) {
          setUser(null)
          localStorage.removeItem('simpus_user')
          clearAuthToken()
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await AuthService.login(credentials)
    const userPayload = res.data?.user ?? null
    const token = res.data?.token ?? null
    if (token) {
      saveAuthToken(token)
    }
    if (userPayload) {
      setUser(userPayload)
      localStorage.setItem('simpus_user', JSON.stringify(userPayload))
    }
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await AuthService.logout()
    } catch {
      // Abaikan error jaringan saat logout
    } finally {
      localStorage.removeItem('simpus_user')
      clearAuthToken()
      setUser(null)
    }
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}
