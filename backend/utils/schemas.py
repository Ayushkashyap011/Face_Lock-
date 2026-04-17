# utils/schemas.py - Pydantic models for API validation
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Request Schemas ──────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    full_name: str
    password: str
    face_image: Optional[str] = None  # Base64-encoded image string


class LoginRequest(BaseModel):
    """Schema for email/password login."""
    email: EmailStr
    password: str


class FaceVerifyRequest(BaseModel):
    """Schema for face verification during login."""
    email: EmailStr
    face_image: str  # Base64-encoded image string


class FaceOnlyLoginRequest(BaseModel):
    """Schema for face-only login (bonus feature)."""
    face_image: str  # Base64-encoded image string


# ── Response Schemas ─────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Public user data returned in responses."""
    id: int
    email: str
    full_name: str
    has_face: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True


class FaceVerifyResponse(BaseModel):
    """Face verification result."""
    verified: bool
    confidence: Optional[float] = None
    message: str
