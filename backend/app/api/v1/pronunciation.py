from fastapi import APIRouter
from app.schemas.writing import PronunciationCheckRequest, PronunciationCheckResponse
from app.services.pronunciation_service import evaluate_pronunciation

router = APIRouter(prefix="/pronunciation", tags=["pronunciation"])

@router.post("/evaluate", response_model=PronunciationCheckResponse)
async def evaluate_spoken_sentence(payload: PronunciationCheckRequest):
    """
    Evaluate user's spoken sentence against target reference.
    Returns word-level phonetic accuracy, filler detection, and WPM.
    """
    return evaluate_pronunciation(
        target_sentence=payload.target_sentence,
        spoken_transcript=payload.spoken_transcript,
        duration_seconds=payload.duration_seconds
    )
