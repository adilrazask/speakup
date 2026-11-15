import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, Date, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class MistakeStat(Base):
    __tablename__ = "mistake_stats"

    id = Column(String, primary_key=True, default=generate_uuid)
    profile_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    error_signature = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    occurrence_count = Column(Integer, default=1)
    last_occurred_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="mistake_stats")

class AnswerBankItem(Base):
    __tablename__ = "answer_bank"

    id = Column(String, primary_key=True, default=generate_uuid)
    profile_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    question_title = Column(String, nullable=False)
    situation = Column(Text, nullable=False)
    task = Column(Text, nullable=False)
    action = Column(Text, nullable=False)
    result = Column(Text, nullable=False)
    full_polished_answer = Column(Text, nullable=False)
    spoken_friendly_version = Column(Text, nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="answer_bank")

class DailyPlan(Base):
    __tablename__ = "daily_plans"

    id = Column(String, primary_key=True, default=generate_uuid)
    profile_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_date = Column(Date, default=date.today, index=True)
    tasks = Column(JSON, nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    profile = relationship("Profile", back_populates="daily_plans")

class ProgressSnapshot(Base):
    __tablename__ = "progress_snapshots"

    id = Column(String, primary_key=True, default=generate_uuid)
    profile_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    snapshot_date = Column(Date, default=date.today, index=True)
    streak_days = Column(Integer, default=1)
    total_practice_minutes = Column(Integer, default=0)
    total_words_learned = Column(Integer, default=0)
    average_interview_score = Column(Integer, default=0)
    current_cefr = Column(String, default="B1")
    mistake_category_breakdown = Column(JSON, nullable=True)

    profile = relationship("Profile", back_populates="progress_snapshots")
