# main.py - FastAPI application entry point
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes.auth import router as auth_router
from routes.face import router as face_router
from routes.user import router as user_router

# ── Logging Configuration ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

# ── Create DB Tables ──────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App Instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="FaceLock API",
    description="Secure authentication with face recognition",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
# In production, restrict origins to your actual frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Face-Required", "X-User-Email"],
)

# ── Register Routers ──────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(face_router)
app.include_router(user_router)


@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "FaceLock API"}


# ── Dev Server ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
