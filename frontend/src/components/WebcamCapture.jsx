// components/WebcamCapture.jsx — Webcam face capture with scan animation

import React, { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Spinner } from './UI'

const VIDEO_CONSTRAINTS = {
  width:       640,
  height:      480,
  facingMode:  'user',
}

/**
 * WebcamCapture
 * Props:
 *   onCapture(base64)  — called with captured image
 *   status             — 'idle' | 'scanning' | 'success' | 'error'
 *   message            — status message to show
 *   autoCapture        — if true, captures automatically after countdown
 */
export default function WebcamCapture({
  onCapture,
  status = 'idle',
  message = '',
  autoCapture = false,
  autoCaptureDelay = 3000,
}) {
  const webcamRef  = useRef(null)
  const [ready, setReady]     = useState(false)
  const [countdown, setCountdown] = useState(null)

  const statusColors = {
    idle:     '#6366f1',
    scanning: '#f59e0b',
    success:  '#10b981',
    error:    '#f43f5e',
  }

  const frameColor = statusColors[status] || statusColors.idle

  // Auto-capture countdown
  useEffect(() => {
    if (!autoCapture || !ready || status !== 'idle') return
    let count = Math.ceil(autoCaptureDelay / 1000)
    setCountdown(count)
    const interval = setInterval(() => {
      count -= 1
      setCountdown(count)
      if (count <= 0) {
        clearInterval(interval)
        setCountdown(null)
        handleCapture()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [ready, autoCapture, status]) // eslint-disable-line

  const handleCapture = useCallback(() => {
    if (!webcamRef.current) return
    const imageSrc = webcamRef.current.getScreenshot({ width: 640, height: 480 })
    if (imageSrc) onCapture(imageSrc)
  }, [onCapture])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

      {/* Camera frame */}
      <div style={{ position: 'relative', width: 280, height: 280 }}>

        {/* Animated border ring */}
        <div style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: `2px solid ${frameColor}`,
          opacity: status === 'scanning' ? 1 : 0.5,
          animation: status === 'scanning' ? 'pulse-ring 1.5s ease-in-out infinite' : 'none',
          transition: 'border-color 0.4s ease',
          zIndex: 3,
        }} />

        {/* Outer glow ring */}
        <div style={{
          position: 'absolute',
          inset: -12,
          borderRadius: '50%',
          border: `1px solid ${frameColor}`,
          opacity: 0.2,
          animation: status === 'scanning' ? 'pulse-ring 1.5s ease-in-out infinite 0.3s' : 'none',
          zIndex: 2,
        }} />

        {/* Video circle clip */}
        <div style={{
          width: 280,
          height: 280,
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#0d0d14',
          position: 'relative',
          zIndex: 1,
        }}>
          {!ready && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
              color: 'var(--text-muted)',
            }}>
              <Spinner size={32} color="var(--accent)" />
              <span style={{ fontSize: 13 }}>Starting camera…</span>
            </div>
          )}

          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={VIDEO_CONSTRAINTS}
            onUserMedia={() => setReady(true)}
            onUserMediaError={() => setReady(false)}
            mirrored={true}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: ready ? 1 : 0,
              transition: 'opacity 0.4s',
            }}
          />

          {/* Scan line overlay */}
          {status === 'scanning' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${frameColor}, transparent)`,
                animation: 'scanline 2s linear infinite',
                opacity: 0.8,
              }} />
            </div>
          )}

          {/* Success / Error overlay */}
          {(status === 'success' || status === 'error') && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${frameColor}22`,
              borderRadius: '50%',
              fontSize: 48,
            }}>
              {status === 'success' ? '✓' : '✕'}
            </div>
          )}

          {/* Countdown badge */}
          {countdown !== null && (
            <div style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'var(--accent-light)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: 22,
              padding: '4px 16px',
              borderRadius: 20,
              backdropFilter: 'blur(8px)',
            }}>
              {countdown}
            </div>
          )}
        </div>

        {/* Corner brackets */}
        {['tl','tr','bl','br'].map(corner => (
          <div key={corner} style={{
            position: 'absolute',
            width: 20,
            height: 20,
            ...(corner.includes('t') ? { top: -2 } : { bottom: -2 }),
            ...(corner.includes('l') ? { left: -2 } : { right: -2 }),
            borderTop:    corner.includes('t') ? `2px solid ${frameColor}` : 'none',
            borderBottom: corner.includes('b') ? `2px solid ${frameColor}` : 'none',
            borderLeft:   corner.includes('l') ? `2px solid ${frameColor}` : 'none',
            borderRight:  corner.includes('r') ? `2px solid ${frameColor}` : 'none',
            zIndex: 4,
            transition: 'border-color 0.4s',
          }} />
        ))}
      </div>

      {/* Face alignment guide */}
      <p style={{
        fontSize: 13,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        textAlign: 'center',
        letterSpacing: '0.04em',
      }}>
        {message || 'Position your face in the circle'}
      </p>

      {/* Manual capture button */}
      {!autoCapture && ready && status === 'idle' && (
        <button
          onClick={handleCapture}
          style={{
            padding: '10px 28px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(99,102,241,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = ''}
        >
          Capture Face
        </button>
      )}
    </div>
  )
}
