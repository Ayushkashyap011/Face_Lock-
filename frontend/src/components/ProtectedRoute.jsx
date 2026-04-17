// components/ProtectedRoute.jsx — Redirects unauthenticated users to /login

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { Spinner } from './UI'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Spinner size={36} color="var(--accent)" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
