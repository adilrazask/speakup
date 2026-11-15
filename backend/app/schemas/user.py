from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class UserAuthRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    pin: str = Field(..., min_length=4, max_length=8)

class ProfileCreateRequest(BaseModel):
    user_id: Optional[str] = None
    full_name: str = Field(..., min_length=2)
    current_role: str = "Professional"
    years_experience: int = 2
    target_role: str = "Operations"
    initial_cefr_level: str = "B1"
    correction_style: str = "after_speaking"  # immediate | after_speaking | major_only
    explanation_lang: str = "en"  # en | hi | te

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    current_role: str
    years_experience: int
    target_role: str
    initial_cefr_level: str
    current_cefr_level: str
    correction_style: str
    explanation_lang: str
    created_at: datetime

    class Config:
        from_attributes = True

class SettingsResponse(BaseModel):
    id: str
    profile_id: str
    tts_voice: str
    tts_speed: float
    slow_mode: bool
    silence_timeout_ms: int
    auto_speak_replies: bool
    theme: str

    class Config:
        from_attributes = True

class SettingsUpdateRequest(BaseModel):
    tts_voice: Optional[str] = None
    tts_speed: Optional[float] = None
    slow_mode: Optional[bool] = None
    silence_timeout_ms: Optional[int] = None
    auto_speak_replies: Optional[bool] = None
    theme: Optional[str] = None
