import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Float, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    profile_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    mode = Column(String, default="coach")  # coach | qa | builder | writing | pronunciation
    title = Column(String, default="English Conversation")
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    profile = relationship("Profile", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String, nullable=False)  # user | agent
    content = Column(Text, nullable=False)
    structured_data = Column(JSON, nullable=True)  # Stores the full CorrectionCard JSON
    audio_duration_seconds = Column(Float, nullable=True)
    wpm = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="messages")
    corrections = relationship("Correction", back_populates="message", cascade="all, delete-orphan")

class Correction(Base):
    __tablename__ = "corrections"

    id = Column(String, primary_key=True, default=generate_uuid)
    message_id = Column(String, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True)
    original_text = Column(Text, nullable=False)
    corrected_text = Column(Text, nullable=False)
    category = Column(String, index=True, nullable=False)  # tense, preposition, article, etc.
    rule_violated = Column(Text, nullable=True)
    explanation_simple = Column(Text, nullable=False)
    explanation_hindi = Column(Text, nullable=True)
    explanation_telugu = Column(Text, nullable=True)
    severity = Column(String, default="minor")  # minor | major
    created_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("Message", back_populates="corrections")
    feedback = relationship("CorrectionFeedback", back_populates="correction", cascade="all, delete-orphan")

class CorrectionFeedback(Base):
    __tablename__ = "correction_feedback"

    id = Column(String, primary_key=True, default=generate_uuid)
    correction_id = Column(String, ForeignKey("corrections.id", ondelete="CASCADE"), nullable=False, index=True)
    user_rating = Column(String, nullable=False)  # accurate | inaccurate | unhelpful
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    correction = relationship("Correction", back_populates="feedback")
