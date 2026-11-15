from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class VocabularyItemResponse(BaseModel):
    id: str
    word_or_phrase: str
    cefr_level: str
    context_tag: str
    definition_simple: str
    workplace_example: str
    collocations: Optional[str] = None

    class Config:
        from_attributes = True

class FlashcardCreateRequest(BaseModel):
    profile_id: str
    front_text: str
    back_text: str
    origin: str = "user_mistake"

class FlashcardResponse(BaseModel):
    id: str
    profile_id: str
    front_text: str
    back_text: str
    origin: str
    repetitions: int
    ease_factor: float
    interval_days: int
    next_review_at: datetime
    last_reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FlashcardReviewRequest(BaseModel):
    flashcard_id: str
    rating: int = Field(..., ge=1, le=5, description="1=Again, 3=Hard, 4=Good, 5=Easy")
