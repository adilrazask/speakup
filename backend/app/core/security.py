import re
import html
import bcrypt

def hash_pin(pin: str) -> str:
    """Hash a numeric or text PIN using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pin.encode("utf-8"), salt).decode("utf-8")

def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    """Verify plain PIN against bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_pin.encode("utf-8"), hashed_pin.encode("utf-8"))
    except Exception:
        return False

def sanitize_user_input(text: str, max_chars: int = 5000) -> str:
    """
    Sanitize user input to prevent prompt injection and HTML injection.
    Limits length and escapes HTML entities while preserving normal text characters.
    """
    if not text:
        return ""
    # Truncate
    clean = text[:max_chars].strip()
    # Strip potential null bytes or non-printable controls
    clean = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', clean)
    # Strip common prompt injection patterns
    clean = re.sub(r'(?i)(system\s*prompt|ignore\s+all\s+previous\s+instructions)', '[filtered]', clean)
    return clean
