import os
from pathlib import Path
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.llm_provider import get_llm_provider, clean_and_repair_json
from app.schemas.chat import CorrectionCardResponse
from app.models.conversation import Session as DBSession, Message as DBMessage, Correction as DBCorrection
from app.models.learning import MistakeStat
from app.models.user import Profile

# Prompt cache
_PROMPTS_CACHE: Dict[str, str] = {}

def get_prompt(name: str) -> str:
    """Read prompt markdown from prompts directory."""
    if name in _PROMPTS_CACHE:
        return _PROMPTS_CACHE[name]
    
    path = settings.PROMPTS_DIR / f"{name}.md"
    if path.exists():
        content = path.read_text(encoding="utf-8")
        _PROMPTS_CACHE[name] = content
        return content
    return ""

async def process_coach_turn(
    user_text: str,
    profile_id: str,
    session_id: str,
    db: AsyncSession,
    wpm: Optional[int] = None,
    audio_duration: Optional[float] = None
) -> CorrectionCardResponse:
    """
    Process one turn of Free Conversation Coach:
    1. Load coach prompt
    2. Retrieve profile context (target role, level, correction style, language)
    3. Invoke LLM for structured output
    4. Save user message, agent message, corrections, and mistake stats to DB
    """
    # 1. Fetch Profile
    stmt = select(Profile).where(Profile.id == profile_id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    
    target_role = profile.target_role if profile else "Operations"
    cefr = profile.current_cefr_level if profile else "B1"
    style = profile.correction_style if profile else "after_speaking"
    lang = profile.explanation_lang if profile else "en"

    # 2. Build Prompt Context
    system_instruction = get_prompt("coach")
    context_prefix = (
        f"Learner Profile: Target Role: {target_role}, Current CEFR: {cefr}, "
        f"Correction Preference: {style}, Preferred Explanation Language: {lang}.\n"
        f"Candidate said (evaluate this): \"{user_text}\""
    )

    llm = get_llm_provider()
    
    try:
        raw_json = await llm.generate_structured(
            prompt=context_prefix,
            system_instruction=system_instruction,
            temperature=0.3
        )
        card_response = CorrectionCardResponse(**raw_json)
    except Exception as e:
        # Fallback to Mock provider or safe default
        fallback_llm = get_llm_provider("mock")
        raw_json = await fallback_llm.generate_structured(
            prompt=context_prefix,
            system_instruction=system_instruction,
            temperature=0.3
        )
        card_response = CorrectionCardResponse(**raw_json)

    # 3. Persist User Message
    user_msg = DBMessage(
        session_id=session_id,
        sender="user",
        content=user_text,
        audio_duration_seconds=audio_duration,
        wpm=wpm
    )
    db.add(user_msg)
    await db.flush()

    # 4. Persist Agent Message with structured data
    agent_msg = DBMessage(
        session_id=session_id,
        sender="agent",
        content=card_response.reply,
        structured_data=card_response.model_dump()
    )
    db.add(agent_msg)
    await db.flush()

    # 5. Persist Individual Corrections & Mistake Stats
    for corr in card_response.corrections:
        db_corr = DBCorrection(
            message_id=agent_msg.id,
            original_text=corr.original,
            corrected_text=corr.corrected,
            category=corr.category,
            rule_violated=corr.rule,
            explanation_simple=corr.explanation_simple,
            explanation_hindi=corr.explanation_hindi,
            explanation_telugu=corr.explanation_telugu,
            severity=corr.severity
        )
        db.add(db_corr)

        # Update or create MistakeStat
        stat_stmt = select(MistakeStat).where(
            MistakeStat.profile_id == profile_id,
            MistakeStat.error_signature == corr.original.lower()
        )
        stat_res = await db.execute(stat_stmt)
        existing_stat = stat_res.scalar_one_or_none()
        if existing_stat:
            existing_stat.occurrence_count += 1
        else:
            new_stat = MistakeStat(
                profile_id=profile_id,
                error_signature=corr.original.lower(),
                category=corr.category,
                occurrence_count=1
            )
            db.add(new_stat)

    await db.commit()
    return card_response
