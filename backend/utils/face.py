# utils/face.py - Face encoding and verification using DeepFace
import base64
import json
import numpy as np
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)

# Similarity threshold: distance below this = same face
# DeepFace Facenet512 cosine distance threshold
FACE_DISTANCE_THRESHOLD = 0.40


def base64_to_image_array(base64_string: str) -> np.ndarray:
    """
    Convert a base64-encoded image string to a numpy array (RGB).
    Strips data URI prefix if present (e.g., 'data:image/jpeg;base64,...').
    """
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]

    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    return np.array(image)


def extract_face_embedding(base64_image: str) -> list[float]:
    """
    Extract a 512-dimensional face embedding from a base64 image using DeepFace.
    Returns a list of floats representing the face encoding.
    Raises ValueError if no face is detected.
    """
    try:
        from deepface import DeepFace

        img_array = base64_to_image_array(base64_image)

        # Use Facenet512 model for high-accuracy embeddings
        embeddings = DeepFace.represent(
            img_path=img_array,
            model_name="Facenet512",
            enforce_detection=True,
            detector_backend="opencv",
        )

        if not embeddings:
            raise ValueError("No face detected in the image")

        # Return the first face's embedding as a plain list
        return embeddings[0]["embedding"]

    except Exception as e:
        logger.error(f"Face embedding extraction failed: {e}")
        raise ValueError(f"Face extraction failed: {str(e)}")


def compare_face_embeddings(
    stored_encoding_json: str,
    live_base64_image: str
) -> tuple[bool, float]:
    """
    Compare a stored face encoding (JSON) with a live webcam image.
    Returns (is_match: bool, distance: float).
    Lower distance = more similar faces.
    """
    try:
        from deepface import DeepFace

        # Deserialize stored encoding
        stored_embedding = json.loads(stored_encoding_json)
        stored_array = np.array(stored_embedding)

        # Get live face embedding
        img_array = base64_to_image_array(live_base64_image)
        live_embeddings = DeepFace.represent(
            img_path=img_array,
            model_name="Facenet512",
            enforce_detection=True,
            detector_backend="opencv",
        )

        if not live_embeddings:
            raise ValueError("No face detected in live image")

        live_array = np.array(live_embeddings[0]["embedding"])

        # Compute cosine distance between embeddings
        cosine_distance = float(
            1 - np.dot(stored_array, live_array) /
            (np.linalg.norm(stored_array) * np.linalg.norm(live_array))
        )

        is_match = cosine_distance < FACE_DISTANCE_THRESHOLD
        confidence = max(0.0, 1.0 - (cosine_distance / FACE_DISTANCE_THRESHOLD))

        logger.info(f"Face comparison: distance={cosine_distance:.4f}, match={is_match}")
        return is_match, round(confidence, 4)

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Face comparison failed: {e}")
        raise ValueError(f"Face comparison failed: {str(e)}")


def serialize_encoding(embedding: list[float]) -> str:
    """Serialize a face embedding list to a JSON string for DB storage."""
    return json.dumps(embedding)
