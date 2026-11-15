from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class InterviewStartRequest(BaseModel):
    profile_id: str
    role_category: str = "Operations"
    interview_type: str = "hr"  # hr | technical | situational | managerial | stress
    difficulty: str = "medium"  # easy | medium | hard
    total_questions: int = 5
    job_description: Optional[str] = None

class AnswerSubmitRequest(BaseModel):
    interview_session_id: str
    question_id: str
    raw_transcript: str
    duration_seconds: float = 0.0
    wpm: int = 0
    fillers_detected: Optional[List[str]] = None

class PerQuestionScore(BaseModel):
    relevance: int
    star_structure: int
    specificity: int
    language_accuracy: int
    fluency: int
    confidence_tone: int
    role_knowledge: int

class PerQuestionEvaluation(BaseModel):
    question_order: int
    question_text: str
    candidate_answer: str
    scores: PerQuestionScore
    what_was_good: str
    what_to_improve: str
    model_answer: str

class SevenDayPlanItem(BaseModel):
    day: int
    focus: str
    action: str

class InterviewReportResponse(BaseModel):
    session_id: str
    overall_score: int
    hire_readiness: str
    summary_strengths: List[str]
    summary_fixes: List[str]
    per_question_evaluations: List[PerQuestionEvaluation]
    seven_day_plan: List[SevenDayPlanItem]
    completed_at: datetime
