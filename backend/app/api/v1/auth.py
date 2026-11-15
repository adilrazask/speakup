from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db
from app.models.user import User, Profile, UserSettings
from app.core.security import hash_pin, verify_pin
from app.schemas.user import (
    UserAuthRequest,
    ProfileCreateRequest,
    ProfileResponse,
    SettingsResponse,
    SettingsUpdateRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/default", response_model=ProfileResponse)
async def get_or_create_default_profile(db: AsyncSession = Depends(get_db)):
    """Fetch the default profile, or auto-create one for instant start."""
    stmt = select(Profile).limit(1)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    
    if not profile:
        # Create default user and profile
        default_user = User(
            username="hyderabad_learner",
            pin_hash=hash_pin("1234")
        )
        db.add(default_user)
        await db.flush()

        profile = Profile(
            user_id=default_user.id,
            full_name="Kiran Kumar",
            current_role="Operations Associate",
            years_experience=2,
            target_role="Operations & Logistics Lead",
            initial_cefr_level="B1",
            current_cefr_level="B1",
            correction_style="after_speaking",
            explanation_lang="en"
        )
        db.add(profile)
        await db.flush()

        settings = UserSettings(
            profile_id=profile.id,
            tts_voice="Google Indian English",
            tts_speed=1.0,
            slow_mode=False,
            silence_timeout_ms=2000,
            auto_speak_replies=True,
            theme="dark"
        )
        db.add(settings)
        await db.commit()
        await db.refresh(profile)

    return profile

@router.post("/profile", response_model=ProfileResponse)
async def create_profile(payload: ProfileCreateRequest, db: AsyncSession = Depends(get_db)):
    """Create a new user profile during onboarding."""
    # Find or create user
    user_id = payload.user_id
    if not user_id:
        user = User(
            username=f"user_{payload.full_name.lower().replace(' ', '_')}",
            pin_hash=hash_pin("1234")
        )
        db.add(user)
        await db.flush()
        user_id = user.id

    profile = Profile(
        user_id=user_id,
        full_name=payload.full_name,
        current_role=payload.current_role,
        years_experience=payload.years_experience,
        target_role=payload.target_role,
        initial_cefr_level=payload.initial_cefr_level,
        current_cefr_level=payload.initial_cefr_level,
        correction_style=payload.correction_style,
        explanation_lang=payload.explanation_lang
    )
    db.add(profile)
    await db.flush()

    # Create default settings
    settings = UserSettings(
        profile_id=profile.id,
        tts_voice="Google Indian English",
        tts_speed=1.0,
        slow_mode=False,
        silence_timeout_ms=2000,
        auto_speak_replies=True,
        theme="dark"
    )
    db.add(settings)
    await db.commit()
    await db.refresh(profile)
    return profile

@router.get("/profile/{profile_id}", response_model=ProfileResponse)
async def get_profile(profile_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Profile).where(Profile.id == profile_id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/settings/{profile_id}", response_model=SettingsResponse)
async def get_settings(profile_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(UserSettings).where(UserSettings.profile_id == profile_id)
    res = await db.execute(stmt)
    settings = res.scalar_one_or_none()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@router.put("/settings/{profile_id}", response_model=SettingsResponse)
async def update_settings(
    profile_id: str,
    payload: SettingsUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserSettings).where(UserSettings.profile_id == profile_id)
    res = await db.execute(stmt)
    settings = res.scalar_one_or_none()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    if payload.tts_voice is not None:
        settings.tts_voice = payload.tts_voice
    if payload.tts_speed is not None:
        settings.tts_speed = payload.tts_speed
    if payload.slow_mode is not None:
        settings.slow_mode = payload.slow_mode
    if payload.silence_timeout_ms is not None:
        settings.silence_timeout_ms = payload.silence_timeout_ms
    if payload.auto_speak_replies is not None:
        settings.auto_speak_replies = payload.auto_speak_replies
    if payload.theme is not None:
        settings.theme = payload.theme

    await db.commit()
    await db.refresh(settings)
    return settings
