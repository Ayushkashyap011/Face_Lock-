// services/api.js — Centralized Axios API client

import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '')

// ── Base Client ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 30000,           // 30s (face ML can be slow)
  headers: { 'Content-Type': 'application/json' },
})

// ── Request Interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response Interceptor: handle token expiry ───────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Auto-logout on 401 (expired/invalid token) — but NOT on login routes
    if (
      err.response?.status === 401 &&
      !err.config.url.includes('/auth/login') &&
      !err.config.url.includes('/auth/signup')
    ) {
      localStorage.removeItem('fl_token')
      localStorage.removeItem('fl_user')
      window.dispatchEvent(new Event('fl:logout'))
    }
    return Promise.reject(err)
  }
)

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  /**
   * Register a new user with optional face image.
   * @param {string} email
   * @param {string} full_name
   * @param {string} password
   * @param {string|null} face_image  Base64 image string
   */
  signup: (email, full_name, password, face_image = null) =>
    api.post('/auth/signup', { email, full_name, password, face_image }),

  /**
   * Login with email + password.
   * Returns JWT directly if no face, or throws 202 if face verification needed.
   */
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
}

// ── Face API ─────────────────────────────────────────────────────────────────
export const faceAPI = {
  /**
   * Verify face after password login. Returns JWT on success.
   * @param {string} email
   * @param {string} face_image  Base64 webcam capture
   */
  verifyFace: (email, face_image) =>
    api.post('/face/verify', { email, face_image }),

  /**
   * Login using face only (no email/password).
   * @param {string} face_image  Base64 webcam capture
   */
  faceOnlyLogin: (face_image) =>
    api.post('/face/login-face-only', { face_image }),
}

// ── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  /** Get authenticated user's profile. */
  getMe: () => api.get('/user/me'),

  /** Update face encoding for authenticated user. */
  updateFace: (face_image) => api.post('/user/update-face', { face_image }),

  /** Remove face lock. */
  removeFace: () => api.delete('/user/remove-face'),
}

export default api
