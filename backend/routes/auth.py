# routes/auth.py - Authentication endpoints: signup, login
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from utils.schemas import SignupRequest, LoginRequest, TokenResponse, MessageResponse, UserResponse
from utils.auth import hash_password, verify_password, create_access_token
from utils.face import extract_face_embedding, serialize_encoding
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user.
    - Validates email uniqueness
    - Hashes password with bcrypt
    - Optionally extracts and stores face encoding
    """
    # Check if email already registered
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash the password
    hashed_pw = hash_password(payload.password)

    # Extract face encoding if image provided
    face_encoding_json = None
    if payload.face_image:
        try:
            embedding = extract_face_embedding(payload.face_image)
            face_encoding_json = serialize_encoding(embedding)
            logger.info(f"Face encoding extracted for {payload.email}")
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Face registration failed: {str(e)}"
            )

    # Create and save user
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hashed_pw,
        face_encoding=face_encoding_json,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return MessageResponse(
        message="Account created successfully! You can now log in.",
        success=True
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate with email and password.
    - If user has a face encoding, returns a flag to trigger face verification
    - If no face, returns JWT directly
    """
    # Look up user
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # If face encoding exists, don't issue token yet — face verification required
    if user.face_encoding:
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="Password verified. Face verification required.",
            headers={"X-Face-Required": "true", "X-User-Email": user.email}
        )

    # No face lock → issue token directly
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            has_face=False,
            created_at=user.created_at,
        )
    )
