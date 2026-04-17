# routes/user.py - Protected user profile endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from utils.schemas import UserResponse, MessageResponse
from utils.auth import get_current_user
from utils.face import extract_face_embedding, serialize_encoding
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/user", tags=["User"])


class UpdateFaceRequest(BaseModel):
    face_image: str  # Base64 image to update face encoding


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        has_face=current_user.face_encoding is not None,
        created_at=current_user.created_at,
    )


@router.post("/update-face", response_model=MessageResponse)
async def update_face(
    payload: UpdateFaceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the face encoding for the authenticated user."""
    try:
        embedding = extract_face_embedding(payload.face_image)
        current_user.face_encoding = serialize_encoding(embedding)
        db.commit()
        return MessageResponse(message="Face encoding updated successfully!")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@router.delete("/remove-face", response_model=MessageResponse)
async def remove_face(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove face lock from the authenticated user's account."""
    current_user.face_encoding = None
    db.commit()
    return MessageResponse(message="Face lock removed from your account.")
