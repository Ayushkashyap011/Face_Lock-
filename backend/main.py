"""
FaceLock API - Main Entry Point

Production-ready authentication service with face recognition.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes.auth import router as auth_router
from routes.face import router as face_router
from routes.user import router as user_router
from config import get_settings


# ── Configuration ─────────────────────────────────────────────────────────────
settings = get_settings()

# ── Logging Configuration ────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Initialize Database ──────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)
logger.info("Database tables initialized")

# ── Create FastAPI Application ──────────────────────────────────────────────
app = FastAPI(
    title="FaceLock API",
    description="Secure authentication with biometric face recognition",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Face-Required", "X-User-Email"],
)

# ── Register Routers ──────────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api")
app.include_router(face_router, prefix="/api")
app.include_router(user_router, prefix="/api")


@app.get("/", tags=["Health"])
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "FaceLock API", "version": "2.0.0"}


# ── Development Server ──────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

