# routes/face.py - Face verification and face-only login endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from utils.schemas import FaceVerifyRequest, FaceVerifyResponse, FaceOnlyLoginRequest, TokenResponse, UserResponse
from utils.auth import verify_password, create_access_token
from utils.face import compare_face_embeddings, extract_face_embedding, serialize_encoding
import json
import numpy as np
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/face", tags=["Face Authentication"])


@router.post("/verify", response_model=TokenResponse)
async def verify_face(payload: FaceVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify face after successful password login.
    - Retrieves stored face encoding for the email
    - Compares with live capture
    - Issues JWT only if face matches
    """
    # Find user
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not user.face_encoding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No face encoding registered for this account"
        )

    # Compare faces
    try:
        is_match, confidence = compare_face_embeddings(
            user.face_encoding,
            payload.face_image
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    if not is_match:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Face verification failed. Please try again."
        )

    # Face matched → issue token
    token = create_access_token({"sub": str(user.id)})
    logger.info(f"Face verified for {user.email} (confidence={confidence})")

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            has_face=True,
            created_at=user.created_at,
        )
    )


@router.post("/login-face-only", response_model=TokenResponse)
async def face_only_login(payload: FaceOnlyLoginRequest, db: Session = Depends(get_db)):
    """
    Bonus: Log in using only face recognition — no email/password required.
    Iterates over all users with face encodings and finds a match.
    """
    # Get all users who have face encodings
    users_with_face = db.query(User).filter(User.face_encoding.isnot(None)).all()

    if not users_with_face:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No face-registered accounts found"
        )

    best_match = None
    best_confidence = 0.0

    for user in users_with_face:
        try:
            is_match, confidence = compare_face_embeddings(
                user.face_encoding,
                payload.face_image
            )
            if is_match and confidence > best_confidence:
                best_match = user
                best_confidence = confidence
        except ValueError:
            continue  # Skip users where comparison fails

    if not best_match:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No matching face found. Please use email/password login."
        )

    token = create_access_token({"sub": str(best_match.id)})
    logger.info(f"Face-only login for {best_match.email} (confidence={best_confidence})")

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=best_match.id,
            email=best_match.email,
            full_name=best_match.full_name,
            has_face=True,
            created_at=best_match.created_at,
        )
    )
