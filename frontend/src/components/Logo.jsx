// components/Logo.jsx — FaceLock brand mark

import React from 'react'

export default function Logo({ size = 32, showText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Icon */}
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
        {/* Face outline */}
        <circle cx="16" cy="13" r="6" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.9" />
        {/* Eyes */}
        <circle cx="13.5" cy="12" r="1" fill="#fff" opacity="0.9" />
        <circle cx="18.5" cy="12" r="1" fill="#fff" opacity="0.9" />
        {/* Mouth */}
        <path d="M13 15 Q16 17.5 19 15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />
        {/* Lock bottom */}
        <rect x="11" y="21" width="10" height="7" rx="2" fill="#fff" opacity="0.15" />
        <rect x="11" y="21" width="10" height="7" rx="2" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.9" />
        <path d="M13 21v-2a3 3 0 0 1 6 0v2" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.9" />
        <circle cx="16" cy="25" r="1" fill="#fff" opacity="0.9" />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: size * 0.6,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
        }}>
          Face<span style={{ color: 'var(--accent-light)' }}>Lock</span>
        </span>
      )}
    </div>
  )
}
