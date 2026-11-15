from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class WritingChange(BaseModel):
    original: str
    replacement: str
    reason: str
    category: str

class ToneVariations(BaseModel):
    formal: str
    confident: str
    friendly: str

class WritingCheckRequest(BaseModel):
    text: str
    document_type: str = "email"  # email | cover_letter | resume_summary | linkedin_about

class WritingCheckResponse(BaseModel):
    corrected_text: str
    tone_variations: ToneVariations
    changes: List[WritingChange]
    scores: Dict[str, int]
    key_takeaway: str

class STARRequest(BaseModel):
    raw_story: str
    target_competency: Optional[str] = "General Competency"

class STARResponse(BaseModel):
    question_title: str
    situation: str
    task: str
    action: str
    result: str
    full_polished_answer: str
    spoken_friendly_version: str
    key_strengths_highlighted: List[str]
    coaching_tip: str

class PronunciationWordScore(BaseModel):
    word: str
    matched_word: Optional[str] = None
    status: str  # correct | close | missed
    phonetic_similarity: float

class PronunciationCheckRequest(BaseModel):
    target_sentence: str
    spoken_transcript: str
    duration_seconds: float = 0.0

class PronunciationCheckResponse(BaseModel):
    target_sentence: str
    spoken_transcript: str
    accuracy_score: int
    wpm: int
    word_scores: List[PronunciationWordScore]
    fillers_detected: List[str]
    disclaimer: str = "Pronunciation scoring is an automated estimate for practice purposes."
