// pages/Signup.jsx — Registration page with optional face enrollment

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { Button, Input, Card, useToast } from '../components/UI'
import WebcamCapture from '../components/WebcamCapture'
import Logo from '../components/Logo'

const STEPS = ['account', 'face', 'done']

export default function Signup() {
  const navigate = useNavigate()
  const { show, element: toastEl } = useToast()

  // Multi-step state
  const [step, setStep] = useState(0)

  // Form fields
  const [form, setForm] = useState({ email: '', full_name: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  // Face state
  const [faceImage, setFaceImage]       = useState(null)
  const [faceStatus, setFaceStatus]     = useState('idle')   // idle|scanning|success|error
  const [faceMessage, setFaceMessage]   = useState('')
  const [skipFace, setSkipFace]         = useState(false)

  const [loading, setLoading] = useState(false)

  // ── Field helpers ──────────────────────────────────────────────────────
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.email)      errs.email     = 'Email is required'
    if (!form.full_name)  errs.full_name = 'Full name is required'
    if (form.password.length < 8) errs.password = 'Minimum 8 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Step 1: Account details ────────────────────────────────────────────
  const handleNextStep = () => {
    if (validate()) setStep(1)
  }

  // ── Step 2: Face capture ───────────────────────────────────────────────
  const handleFaceCapture = (base64) => {
    setFaceImage(base64)
    setFaceStatus('success')
    setFaceMessage('Face captured! Click Register to continue.')
  }

  const handleRetake = () => {
    setFaceImage(null)
    setFaceStatus('idle')
    setFaceMessage('')
  }

  // ── Step 3: Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    try {
      await authAPI.signup(
        form.email,
        form.full_name,
        form.password,
        skipFace ? null : faceImage
      )
      setStep(2)
    } catch (err) {
      const detail = err.response?.data?.detail || 'Signup failed. Please try again.'
      show(detail, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Layout ─────────────────────────────────────────────────────────────
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
        top: '-20vh',
        right: '-10vw',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeUp 0.5s ease' }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          <Logo size={40} />
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{
              width: i === step ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: i <= step ? 'var(--accent)' : 'var(--border)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <Card glow={step === 0}>

          {/* ── STEP 0: Account details ────────────────────────────── */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h2 style={{ marginBottom: 6 }}>Create account</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Secure authentication with biometric protection
                </p>
              </div>

              <Input
                label="Full Name"
                placeholder="Jane Doe"
                value={form.full_name}
                onChange={set('full_name')}
                error={errors.full_name}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                hint="Use a strong password"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={set('confirm')}
                error={errors.confirm}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />

              <Button onClick={handleNextStep} fullWidth size="lg">
                Continue →
              </Button>

              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 1: Face enrollment ────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: 6 }}>Register your face</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  This adds an extra layer of biometric security to your account
                </p>
              </div>

              {!skipFace && (
                <WebcamCapture
                  onCapture={handleFaceCapture}
                  status={faceStatus}
                  message={faceMessage || (faceImage ? 'Face captured!' : 'Look directly at the camera')}
                />
              )}

              {faceImage && !skipFace && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button variant="ghost" onClick={handleRetake} size="sm">↺ Retake</Button>
                  <Button onClick={handleSubmit} loading={loading} size="sm">Register →</Button>
                </div>
              )}

              {!faceImage && !skipFace && (
                <button
                  onClick={() => setSkipFace(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Skip face registration
                </button>
              )}

              {skipFace && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    You can add face lock later from your profile.
                  </p>
                  <Button onClick={handleSubmit} loading={loading} fullWidth>
                    Create account without face lock
                  </Button>
                  <button
                    onClick={() => setSkipFace(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ← Go back to face registration
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Success ────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
              <div style={{
                width: 80, height: 80,
                borderRadius: '50%',
                background: 'var(--success-dim)',
                border: '2px solid var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
                animation: 'fadeUp 0.4s ease',
              }}>
                ✓
              </div>
              <div>
                <h2 style={{ color: 'var(--success)', marginBottom: 8 }}>Account created!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Welcome, {form.full_name}. Your account is ready.
                </p>
              </div>
              <Button onClick={() => navigate('/login')} fullWidth size="lg">
                Go to Login
              </Button>
            </div>
          )}

        </Card>
      </div>
    </div>
  )
}
