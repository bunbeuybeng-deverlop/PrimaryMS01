import { createContext, useState, useEffect } from 'react'
import { authService } from '../services/authService.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const stored = authService.getCurrentUser()
      const token = localStorage.getItem('token')
      if (stored && token) {
        setUser(stored)
        try {
          const fresh = await authService.getMe()
          if (fresh) setUser(fresh)
        } catch {
          // If token is invalid or expired, interceptor will clear and redirect if needed
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (credentials) => {
    const userData = await authService.login(credentials)
    setUser(userData)
    return userData
  }

  const register = async (payload) => {
    const userData = await authService.register(payload)
    setUser(userData)
    return userData
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
