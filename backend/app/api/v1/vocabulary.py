from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db
from app.models.vocabulary import VocabularyItem, Flashcard
from app.schemas.vocabulary import (
    VocabularyItemResponse,
    FlashcardCreateRequest,
    FlashcardResponse,
    FlashcardReviewRequest,
)
from app.services.sm2_service import calculate_sm2

router = APIRouter(prefix="/vocabulary", tags=["vocabulary"])

@router.get("/daily", response_model=List[VocabularyItemResponse])
async def get_daily_vocabulary(cefr_level: str = "B1", limit: int = 5, db: AsyncSession = Depends(get_db)):
    """Fetch 5 daily workplace vocabulary items at or near user's CEFR level."""
    stmt = select(VocabularyItem).where(VocabularyItem.cefr_level == cefr_level).limit(limit)
    res = await db.execute(stmt)
    items = res.scalars().all()
    if not items:
        # Fallback to any items
        fallback_stmt = select(VocabularyItem).limit(limit)
        fb_res = await db.execute(fallback_stmt)
        items = fb_res.scalars().all()
    return items

@router.get("/flashcards/{profile_id}", response_model=List[FlashcardResponse])
async def get_flashcards(profile_id: str, due_only: bool = False, db: AsyncSession = Depends(get_db)):
    """Retrieve flashcards for a user, optionally filtering for items due for review."""
    stmt = select(Flashcard).where(Flashcard.profile_id == profile_id)
    if due_only:
        stmt = stmt.where(Flashcard.next_review_at <= datetime.utcnow())
    stmt = stmt.order_by(Flashcard.next_review_at)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/flashcards", response_model=FlashcardResponse)
async def create_flashcard(payload: FlashcardCreateRequest, db: AsyncSession = Depends(get_db)):
    """Manually add or auto-convert a mistake into a flashcard."""
    card = Flashcard(
        profile_id=payload.profile_id,
        front_text=payload.front_text,
        back_text=payload.back_text,
        origin=payload.origin,
        repetitions=0,
        ease_factor=2.5,
        interval_days=1,
        next_review_at=datetime.utcnow()
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card

@router.post("/flashcards/review", response_model=FlashcardResponse)
async def review_flashcard(payload: FlashcardReviewRequest, db: AsyncSession = Depends(get_db)):
    """Submit recall rating (1 to 5) and update SM-2 interval."""
    stmt = select(Flashcard).where(Flashcard.id == payload.flashcard_id)
    res = await db.execute(stmt)
    card = res.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    new_reps, new_ef, new_interval, next_review = calculate_sm2(
        rating=payload.rating,
        repetitions=card.repetitions,
        ease_factor=card.ease_factor,
        interval_days=card.interval_days
    )

    card.repetitions = new_reps
    card.ease_factor = new_ef
    card.interval_days = new_interval
    card.next_review_at = next_review
    card.last_reviewed_at = datetime.utcnow()

    await db.commit()
    await db.refresh(card)
    return card
