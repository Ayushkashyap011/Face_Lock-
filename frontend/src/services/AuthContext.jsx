// services/AuthContext.jsx — Global authentication state via React Context

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { userAPI } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('fl_user')) } catch { return null }
  })
  const [token, setToken]     = useState(() => localStorage.getItem('fl_token'))
  const [loading, setLoading] = useState(false)

  // Persist auth state
  const saveAuth = useCallback((tokenValue, userData) => {
    localStorage.setItem('fl_token', tokenValue)
    localStorage.setItem('fl_user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fl_token')
    localStorage.removeItem('fl_user')
    setToken(null)
    setUser(null)
  }, [])

  // Listen for auto-logout events from API interceptor
  useEffect(() => {
    window.addEventListener('fl:logout', logout)
    return () => window.removeEventListener('fl:logout', logout)
  }, [logout])

  // Revalidate token on mount
  useEffect(() => {
    if (!token) return
    setLoading(true)
    userAPI.getMe()
      .then(res => setUser(res.data))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    saveAuth,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
