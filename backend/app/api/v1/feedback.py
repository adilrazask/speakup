from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.models.conversation import CorrectionFeedback
from app.schemas.chat import FeedbackPayload

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.post("/correction")
async def report_bad_correction(payload: FeedbackPayload, db: AsyncSession = Depends(get_db)):
    """Log user feedback on a correction to continuously improve system prompts."""
    fb = CorrectionFeedback(
        correction_id=payload.correction_id,
        user_rating=payload.user_rating,
        notes=payload.notes
    )
    db.add(fb)
    await db.commit()
    await db.refresh(fb)
    return {"status": "success", "id": fb.id}
