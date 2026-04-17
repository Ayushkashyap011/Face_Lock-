// components/UI.jsx — Shared primitive UI components

import React, { useState, useEffect } from 'react'

/* ── Button ─────────────────────────────────────────────────────────────── */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.18s ease',
    borderRadius: 'var(--radius-md)',
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    overflow: 'hidden',
    opacity: disabled ? 0.5 : 1,
  }

  const sizes = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '12px 24px', fontSize: '15px' },
    lg: { padding: '16px 32px', fontSize: '16px' },
  }

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: '#fff',
      boxShadow: '0 0 20px rgba(99,102,241,0.3)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--error-dim)',
      color: 'var(--error)',
      border: '1px solid rgba(244,63,94,0.2)',
    },
    success: {
      background: 'var(--success-dim)',
      color: 'var(--success)',
      border: '1px solid rgba(16,185,129,0.2)',
    },
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.filter = 'brightness(1.1)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.filter = ''
      }}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  )
}

/* ── Input ──────────────────────────────────────────────────────────────── */
export function Input({
  label,
  error,
  hint,
  icon,
  type = 'text',
  style = {},
  ...props
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {label && (
        <label style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? 'var(--accent-light)' : 'var(--text-muted)',
            display: 'flex',
            transition: 'color 0.2s',
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: icon ? '13px 14px 13px 44px' : '13px 14px',
            background: 'var(--bg-elevated)',
            border: `1px solid ${error ? 'var(--error)' : focused ? 'var(--border-glow)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? `0 0 0 3px var(--accent-dim)` : 'none',
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--error)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  )
}

/* ── Spinner ────────────────────────────────────────────────────────────── */
export function Spinner({ size = 20, color = 'currentColor' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/* ── Toast Notification ─────────────────────────────────────────────────── */
export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: { bg: 'var(--success-dim)', border: 'rgba(16,185,129,0.3)', color: 'var(--success)' },
    error:   { bg: 'var(--error-dim)',   border: 'rgba(244,63,94,0.3)',   color: 'var(--error)' },
    info:    { bg: 'var(--accent-dim)',  border: 'var(--border-glow)',    color: 'var(--accent-light)' },
  }

  const c = colors[type] || colors.info

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      padding: '14px 20px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-md)',
      color: c.color,
      fontWeight: 500,
      fontSize: '14px',
      backdropFilter: 'blur(12px)',
      maxWidth: '360px',
      boxShadow: 'var(--shadow-lg)',
      animation: 'fadeUp 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }} onClick={onClose}>
      <span>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      {message}
    </div>
  )
}

/* ── useToast hook ──────────────────────────────────────────────────────── */
export function useToast() {
  const [toast, setToast] = useState(null)
  const show = (message, type = 'info') => setToast({ message, type })
  const hide = () => setToast(null)
  const element = toast ? <Toast {...toast} onClose={hide} /> : null
  return { show, hide, element }
}

/* ── Card ───────────────────────────────────────────────────────────────── */
export function Card({ children, style = {}, glow = false }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '40px',
      boxShadow: glow ? 'var(--shadow-accent)' : 'var(--shadow-md)',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Divider with label ─────────────────────────────────────────────────── */
export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      {label && <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}
