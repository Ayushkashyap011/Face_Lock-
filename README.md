# 🔐 FaceLock — Biometric Authentication System

A full-stack application combining **JWT authentication** with **face recognition** for secure, passwordless login.

---

## 🏗️ Architecture

```
facelock/
├── backend/                  # FastAPI (Python)
│   ├── main.py               # App entry point, CORS, routing
│   ├── database.py           # SQLAlchemy engine + session factory
│   ├── requirements.txt
│   ├── models/
│   │   └── user.py           # User ORM model
│   ├── routes/
│   │   ├── auth.py           # POST /auth/signup, /auth/login
│   │   ├── face.py           # POST /face/verify, /face/login-face-only
│   │   └── user.py           # GET /user/me, POST /user/update-face
│   └── utils/
│       ├── auth.py           # JWT creation/verification, bcrypt helpers
│       ├── face.py           # DeepFace embedding extraction & comparison
│       └── schemas.py        # Pydantic request/response models
│
└── frontend/                 # React + Vite
    ├── index.html
    ├── vite.config.js        # Dev proxy to backend
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx           # Router + AuthProvider
    │   ├── index.css         # Design system tokens
    │   ├── components/
    │   │   ├── UI.jsx        # Button, Input, Toast, Card, Spinner
    │   │   ├── WebcamCapture.jsx  # Face capture UI with animations
    │   │   ├── ProtectedRoute.jsx # JWT-guarded routes
    │   │   └── Logo.jsx
    │   ├── pages/
    │   │   ├── Signup.jsx    # 3-step registration with face enrollment
    │   │   ├── Login.jsx     # Password + face verification flow
    │   │   └── Home.jsx      # Protected dashboard
    │   └── services/
    │       ├── api.js        # Axios client with JWT interceptors
    │       └── AuthContext.jsx  # Global auth state (React Context)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Webcam

### 1. Start the Backend

```bash
cd backend
chmod +x setup_backend.sh
./setup_backend.sh
```

The API will be available at `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend
chmod +x setup_frontend.sh
./setup_frontend.sh
```

The app will open at `http://localhost:3000`

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | — | Register with optional face |
| POST | `/auth/login` | — | Email+password login |
| POST | `/face/verify` | — | Verify face after password |
| POST | `/face/login-face-only` | — | Login using face alone |
| GET | `/user/me` | JWT | Get profile |
| POST | `/user/update-face` | JWT | Update face encoding |
| DELETE | `/user/remove-face` | JWT | Remove face lock |

### Login Flow Diagram

```
[User enters email + password]
          │
          ▼
   Password correct?
     │         │
    No         Yes
     │         │
   401      Has face encoding?
              │         │
             No         Yes
              │         │
           Return       Return HTTP 202
            JWT       "Face required"
                          │
                          ▼
                  [Webcam activates]
                  [Face captured & sent]
                          │
                     Face matches?
                       │       │
                      No       Yes
                       │       │
                     401    Return JWT
```

---

## 🔒 Security Design

| Feature | Implementation |
|---------|---------------|
| Password storage | bcrypt (12 rounds) |
| Authentication | JWT (HS256, 24hr expiry) |
| Face encoding | DeepFace Facenet512 (512-dim cosine similarity) |
| Face threshold | Cosine distance < 0.40 |
| Token storage | localStorage (swap to httpOnly cookie in production) |
| CORS | Restricted to localhost:3000 in dev |

---

## 🎨 Frontend Features

- **Multi-step signup** with animated step indicators
- **Webcam face capture** with circular overlay, scan animation, countdown timer, and corner brackets
- **Auto-capture** mode (3-second countdown) for face verification
- **Face-only login** — no email or password needed
- **Manage face lock** from the dashboard (add, update, remove)
- **Token expiry handling** — auto-logout with event system
- **Dark theme** with indigo accent, noise texture, gradient blobs

---

## ⚙️ Configuration

### Backend (utils/auth.py)
```python
SECRET_KEY = "your-secret-key"          # Change in production!
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24   # Token lifetime
```

### Face Recognition (utils/face.py)
```python
FACE_DISTANCE_THRESHOLD = 0.40   # Lower = stricter matching
# Model: Facenet512 (most accurate)
# Backend: opencv detector (fastest)
```

### Production Checklist
- [ ] Replace `SECRET_KEY` with a secure random value from env
- [ ] Switch SQLite → PostgreSQL
- [ ] Restrict CORS to your production domain
- [ ] Use httpOnly cookies instead of localStorage for tokens
- [ ] Add rate limiting to auth endpoints
- [ ] Enable HTTPS

---

## 🐛 Troubleshooting

**Camera not working:** Check browser permissions — allow camera access for localhost.

**Face not detected:** Ensure good lighting, face camera straight-on, remove glasses if having issues.

**DeepFace slow first run:** It downloads model weights (~90MB) on first use. Subsequent calls are fast.

**`202 Accepted` in network tab during login:** This is correct behavior — it signals face verification is required.
