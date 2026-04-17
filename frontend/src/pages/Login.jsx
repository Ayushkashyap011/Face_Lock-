// pages/Login.jsx — Login with email/password + face verification

import React, { useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authAPI, faceAPI } from '../services/api'
import { useAuth } from '../services/AuthContext'
import { Button, Input, Card, Divider, useToast, Spinner } from '../components/UI'
import WebcamCapture from '../components/WebcamCapture'
import Logo from '../components/Logo'

const MODE_PASSWORD  = 'password'   // email+password form
const MODE_FACE_VERIFY = 'face_verify' // face verification after password
const MODE_FACE_ONLY   = 'face_only'   // face-only login

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { saveAuth } = useAuth()
  const { show, element: toastEl } = useToast()

  const from = location.state?.from?.pathname || '/home'

  const [mode, setMode]       = useState(MODE_PASSWORD)
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  // Face verification state
  const [faceStatus, setFaceStatus]   = useState('idle')
  const [faceMessage, setFaceMessage] = useState('')

  // ── Step 1: Password login ─────────────────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e?.preventDefault()
    const errs = {}
    if (!email)    errs.email    = 'Email is required'
    if (!password) errs.password = 'Password is required'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      const res = await authAPI.login(email, password)
      // No face required → login directly
      saveAuth(res.data.access_token, res.data.user)
      navigate(from, { replace: true })
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail || ''

      if (status === 202) {
        // Face verification required
        setMode(MODE_FACE_VERIFY)
        setFaceMessage('Password verified. Now scan your face.')
        return
      }
      show(detail || 'Invalid email or password', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Face verification after password ───────────────────────────
  const handleFaceVerify = useCallback(async (base64Image) => {
    setFaceStatus('scanning')
    setFaceMessage('Verifying your face…')
    try {
      const res = await faceAPI.verifyFace(email, base64Image)
      setFaceStatus('success')
      setFaceMessage('Face verified! Logging you in…')
      setTimeout(() => {
        saveAuth(res.data.access_token, res.data.user)
        navigate(from, { replace: true })
      }, 900)
    } catch (err) {
      setFaceStatus('error')
      const detail = err.response?.data?.detail || 'Face verification failed'
      setFaceMessage(detail)
      show(detail, 'error')
      // Reset after 2.5s to allow retry
      setTimeout(() => {
        setFaceStatus('idle')
        setFaceMessage('Try again — look directly at the camera')
      }, 2500)
    }
  }, [email, saveAuth, navigate, from, show])

  // ── Face-only login ────────────────────────────────────────────────────
  const handleFaceOnlyLogin = useCallback(async (base64Image) => {
    setFaceStatus('scanning')
    setFaceMessage('Scanning for your face…')
    try {
      const res = await faceAPI.faceOnlyLogin(base64Image)
      setFaceStatus('success')
      setFaceMessage(`Welcome back, ${res.data.user.full_name}!`)
      setTimeout(() => {
        saveAuth(res.data.access_token, res.data.user)
        navigate(from, { replace: true })
      }, 900)
    } catch (err) {
      setFaceStatus('error')
      const detail = err.response?.data?.detail || 'No matching face found'
      setFaceMessage(detail)
      show(detail, 'error')
      setTimeout(() => {
        setFaceStatus('idle')
        setFaceMessage('Try again or use email/password')
      }, 2500)
    }
  }, [saveAuth, navigate, from, show])

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      {toastEl}

      {/* Background gradient blob */}
      <div style={{
        position: 'fixed',
        bottom: '-20vh',
        left: '-10vw',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.5s ease' }}>

        {/* Logo */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          <Logo size={40} />
        </div>

        <Card glow>

          {/* ── Password mode ──────────────────────────────────────── */}
          {mode === MODE_PASSWORD && (
            <form
              onSubmit={handlePasswordLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <div>
                <h2 style={{ marginBottom: 6 }}>Welcome back</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Sign in to your account
                </p>
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={errors.password}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Sign in
              </Button>

              <Divider label="OR" />

              {/* Face-only login button */}
              <Button
                variant="ghost"
                fullWidth
                onClick={() => { setMode(MODE_FACE_ONLY); setFaceStatus('idle'); setFaceMessage('') }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M8 14s-2 1-2 3h12c0-2-2-3-2-3"/>
                  <path d="M9 11.5c0 0 1 1 3 1s3-1 3-1"/>
                </svg>
                Login with Face Only
              </Button>

              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <Link to="/signup">Create one</Link>
              </p>
            </form>
          )}

          {/* ── Face verification after password ───────────────────── */}
          {mode === MODE_FACE_VERIFY && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--success-dim)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  color: 'var(--success)',
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 12,
                }}>
                  ✓ Password verified
                </div>
                <h2 style={{ marginBottom: 6 }}>Face verification</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  One more step — confirm it's you
                </p>
              </div>

              <WebcamCapture
                onCapture={handleFaceVerify}
                status={faceStatus}
                message={faceMessage}
                autoCapture={faceStatus === 'idle'}
                autoCaptureDelay={3000}
              />

              <button
                onClick={() => setMode(MODE_PASSWORD)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Back to login
              </button>
            </div>
          )}

          {/* ── Face-only login ────────────────────────────────────── */}
          {mode === MODE_FACE_ONLY && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: 6 }}>Face Login</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  We'll find your account by your face
                </p>
              </div>

              <WebcamCapture
                onCapture={handleFaceOnlyLogin}
                status={faceStatus}
                message={faceMessage}
                autoCapture={faceStatus === 'idle'}
                autoCaptureDelay={3000}
              />

              <button
                onClick={() => { setMode(MODE_PASSWORD); setFaceStatus('idle'); setFaceMessage('') }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Use email & password instead
              </button>
            </div>
          )}

        </Card>
      </div>
    </div>
  )
}
