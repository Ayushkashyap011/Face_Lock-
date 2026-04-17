// pages/Home.jsx — Protected dashboard after successful login

import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { userAPI } from '../services/api'
import { Button, Card, useToast, Spinner } from '../components/UI'
import WebcamCapture from '../components/WebcamCapture'
import Logo from '../components/Logo'

export default function Home() {
  const { user, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const { show, element: toastEl } = useToast()

  const [showFaceUpdate, setShowFaceUpdate] = useState(false)
  const [faceStatus, setFaceStatus]         = useState('idle')
  const [faceMessage, setFaceMessage]       = useState('')
  const [removingFace, setRemovingFace]     = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ── Update face encoding ──────────────────────────────────────────────
  const handleFaceCapture = useCallback(async (base64Image) => {
    setFaceStatus('scanning')
    setFaceMessage('Processing face encoding…')
    try {
      await userAPI.updateFace(base64Image)
      setFaceStatus('success')
      setFaceMessage('Face encoding updated!')
      setUser(u => ({ ...u, has_face: true }))
      show('Face lock updated successfully!', 'success')
      setTimeout(() => {
        setShowFaceUpdate(false)
        setFaceStatus('idle')
        setFaceMessage('')
      }, 2000)
    } catch (err) {
      setFaceStatus('error')
      const detail = err.response?.data?.detail || 'Failed to update face'
      setFaceMessage(detail)
      show(detail, 'error')
      setTimeout(() => { setFaceStatus('idle'); setFaceMessage('') }, 2500)
    }
  }, [show, setUser])

  // ── Remove face lock ──────────────────────────────────────────────────
  const handleRemoveFace = async () => {
    if (!window.confirm('Remove face lock from your account?')) return
    setRemovingFace(true)
    try {
      await userAPI.removeFace()
      setUser(u => ({ ...u, has_face: false }))
      show('Face lock removed', 'info')
    } catch {
      show('Failed to remove face lock', 'error')
    } finally {
      setRemovingFace(false)
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={36} color="var(--accent)" />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {toastEl}

      {/* Background accent blobs */}
      <div style={{
        position: 'fixed', top: '-30vh', right: '-20vw',
        width: '70vw', height: '70vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(5,5,8,0.8)',
      }}>
        <Logo size={28} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            {user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </Button>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '48px 24px', maxWidth: 900, margin: '0 auto', width: '100%' }}>

        {/* Welcome banner */}
        <div style={{
          marginBottom: 48,
          animation: 'fadeUp 0.5s ease',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-light)', fontSize: 13, marginBottom: 8 }}>
            // authenticated
          </p>
          <h1 style={{ marginBottom: 8 }}>
            Welcome back,<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-light), #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {user.full_name}
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Your account is secured with FaceLock authentication.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 40,
          animation: 'fadeUp 0.5s ease 0.1s both',
        }}>
          {[
            {
              label: 'Security Level',
              value: user.has_face ? 'Maximum' : 'Standard',
              color: user.has_face ? 'var(--success)' : 'var(--warning)',
              icon: '🛡️',
            },
            {
              label: 'Face Lock',
              value: user.has_face ? 'Active' : 'Not set',
              color: user.has_face ? 'var(--success)' : 'var(--text-muted)',
              icon: '👁️',
            },
            {
              label: 'Account ID',
              value: `#${String(user.id).padStart(6, '0')}`,
              color: 'var(--accent-light)',
              icon: '🔑',
            },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{stat.icon}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                {stat.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Security settings card */}
        <Card style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
          <h3 style={{ marginBottom: 6 }}>Face Lock Settings</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
            {user.has_face
              ? 'Your face is registered. You can update or remove it below.'
              : 'Add face lock to require biometric verification on every login.'}
          </p>

          {!showFaceUpdate ? (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button
                variant={user.has_face ? 'ghost' : 'primary'}
                onClick={() => { setShowFaceUpdate(true); setFaceStatus('idle'); setFaceMessage('') }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                </svg>
                {user.has_face ? 'Update Face' : 'Add Face Lock'}
              </Button>

              {user.has_face && (
                <Button variant="danger" onClick={handleRemoveFace} loading={removingFace}>
                  Remove Face Lock
                </Button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
              <WebcamCapture
                onCapture={handleFaceCapture}
                status={faceStatus}
                message={faceMessage || 'Look directly at the camera, then click Capture'}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowFaceUpdate(false); setFaceStatus('idle') }}
              >
                Cancel
              </Button>
            </div>
          )}
        </Card>

        {/* Account info card */}
        <Card style={{ marginTop: 24, animation: 'fadeUp 0.5s ease 0.3s both' }}>
          <h3 style={{ marginBottom: 20 }}>Account Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Full Name', value: user.full_name },
              { label: 'Email',     value: user.email },
              { label: 'Member Since', value: new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {row.label}
                </span>
                <span style={{ fontWeight: 500, fontSize: 15 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Card>

      </main>
    </div>
  )
}
