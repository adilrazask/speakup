import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    profile_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    role_category = Column(String, default="Operations")
    interview_type = Column(String, default="hr")  # hr | technical | situational | managerial | stress
    difficulty = Column(String, default="medium")  # easy | medium | hard
    job_description = Column(Text, nullable=True)
    total_questions = Column(Integer, default=5)
    overall_score = Column(Integer, nullable=True)  # 0 to 100
    hire_readiness = Column(String, nullable=True)  # Needs work | Developing | Good | Strong
    summary_strengths = Column(JSON, nullable=True)
    summary_fixes = Column(JSON, nullable=True)
    seven_day_plan = Column(JSON, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    profile = relationship("Profile", back_populates="interview_sessions")
    questions = relationship("InterviewQuestion", back_populates="interview_session", cascade="all, delete-orphan", order_by="InterviewQuestion.question_order")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    interview_session_id = Column(String, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_order = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="behavioral")
    target_competency = Column(String, default="General")

    interview_session = relationship("InterviewSession", back_populates="questions")
    answers = relationship("InterviewAnswer", back_populates="question", cascade="all, delete-orphan", uselist=False)

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(String, primary_key=True, default=generate_uuid)
    question_id = Column(String, ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    raw_transcript = Column(Text, nullable=False)
    duration_seconds = Column(Float, default=0.0)
    wpm = Column(Integer, default=0)
    fillers_detected = Column(JSON, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("InterviewQuestion", back_populates="answers")
    score = relationship("InterviewScore", back_populates="answer", cascade="all, delete-orphan", uselist=False)

class InterviewScore(Base):
    __tablename__ = "interview_scores"

    id = Column(String, primary_key=True, default=generate_uuid)
    answer_id = Column(String, ForeignKey("interview_answers.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    relevance_score = Column(Integer, default=70)
    star_structure_score = Column(Integer, default=70)
    specificity_score = Column(Integer, default=70)
    language_accuracy_score = Column(Integer, default=70)
    fluency_score = Column(Integer, default=70)
    confidence_tone_score = Column(Integer, default=70)
    role_knowledge_score = Column(Integer, default=70)
    what_was_good = Column(Text, nullable=True)
    what_to_improve = Column(Text, nullable=True)
    model_answer = Column(Text, nullable=True)

    answer = relationship("InterviewAnswer", back_populates="score")
