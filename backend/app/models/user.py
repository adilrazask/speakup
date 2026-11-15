import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    pin_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profiles = relationship("Profile", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name = Column(String, nullable=False)
    current_role = Column(String, default="Professional")
    years_experience = Column(Integer, default=2)
    target_role = Column(String, default="Operations")
    initial_cefr_level = Column(String, default="B1")
    current_cefr_level = Column(String, default="B1")
    correction_style = Column(String, default="after_speaking")  # immediate | after_speaking | major_only
    explanation_lang = Column(String, default="en")  # en | hi | te
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="profiles")
    settings = relationship("UserSettings", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="profile", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="profile", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="profile", cascade="all, delete-orphan")
    mistake_stats = relationship("MistakeStat", back_populates="profile", cascade="all, delete-orphan")
    answer_bank = relationship("AnswerBankItem", back_populates="profile", cascade="all, delete-orphan")
    daily_plans = relationship("DailyPlan", back_populates="profile", cascade="all, delete-orphan")
    progress_snapshots = relationship("ProgressSnapshot", back_populates="profile", cascade="all, delete-orphan")

class UserSettings(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default=generate_uuid)
    profile_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    tts_voice = Column(String, default="Google Indian English")
    tts_speed = Column(Float, default=1.0)
    slow_mode = Column(Boolean, default=False)
    silence_timeout_ms = Column(Integer, default=2000)
    auto_speak_replies = Column(Boolean, default=True)
    theme = Column(String, default="dark")

    profile = relationship("Profile", back_populates="settings")
