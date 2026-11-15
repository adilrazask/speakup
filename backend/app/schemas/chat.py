from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CorrectionItem(BaseModel):
    original: str = Field(..., description="The substring spoken by user with mistake")
    corrected: str = Field(..., description="The corrected substring")
    category: str = Field(..., description="tense | article | preposition | subject-verb | vocabulary | collocation | fluency")
    rule: str = Field(..., description="Concise rule violated")
    explanation_simple: str = Field(..., description="Encouraging simple plain English explanation")
    explanation_hindi: Optional[str] = Field(None, description="Optional Hindi explanation")
    explanation_telugu: Optional[str] = Field(None, description="Optional Telugu explanation")
    severity: str = Field(default="minor", description="minor | major")

class VocabSuggestion(BaseModel):
    word: str
    meaning: str
    example: str

class FluencyNotes(BaseModel):
    fillers: List[str] = Field(default_factory=list)
    wpm: Optional[int] = None
    long_pauses_count: Optional[int] = 0

class DomainScores(BaseModel):
    grammar: int = Field(default=75, ge=0, le=100)
    vocabulary: int = Field(default=70, ge=0, le=100)
    fluency: int = Field(default=70, ge=0, le=100)
    clarity: int = Field(default=75, ge=0, le=100)
    confidence: int = Field(default=70, ge=0, le=100)

class CorrectionCardResponse(BaseModel):
    reply: str = Field(..., description="Natural conversational reply plus one follow-up question")
    corrections: List[CorrectionItem] = Field(default_factory=list)
    better_version: str = Field(..., description="Polished version of user's complete thought")
    vocabulary_suggestions: List[VocabSuggestion] = Field(default_factory=list)
    fluency_notes: FluencyNotes = Field(default_factory=FluencyNotes)
    scores: DomainScores = Field(default_factory=DomainScores)
    praise: str = Field(default="Great effort communicating your idea clearly!", description="One genuine positive observation")
    next_tip: str = Field(default="Try keeping your main result at the end of the sentence.", description="Actionable next tip")

class ChatMessagePayload(BaseModel):
    session_id: str
    profile_id: str
    content: str
    mode: str = "coach"
    audio_duration_seconds: Optional[float] = None
    wpm: Optional[int] = None

class FeedbackPayload(BaseModel):
    correction_id: str
    user_rating: str  # accurate | inaccurate | unhelpful
    notes: Optional[str] = None
