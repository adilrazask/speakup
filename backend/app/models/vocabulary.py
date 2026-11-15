import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class VocabularyItem(Base):
    __tablename__ = "vocabulary"

    id = Column(String, primary_key=True, default=generate_uuid)
    word_or_phrase = Column(String, unique=True, index=True, nullable=False)
    cefr_level = Column(String, default="B1")
    context_tag = Column(String, default="workplace")  # interview | workplace | email | logistics | tech
    definition_simple = Column(Text, nullable=False)
    workplace_example = Column(Text, nullable=False)
    collocations = Column(Text, nullable=True)

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(String, primary_key=True, default=generate_uuid)
    profile_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    front_text = Column(Text, nullable=False)
    back_text = Column(Text, nullable=False)
    origin = Column(String, default="vocabulary_seed")  # vocabulary_seed | user_mistake
    repetitions = Column(Integer, default=0)
    ease_factor = Column(Float, default=2.5)
    interval_days = Column(Integer, default=1)
    next_review_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_reviewed_at = Column(DateTime, nullable=True)

    profile = relationship("Profile", back_populates="flashcards")
