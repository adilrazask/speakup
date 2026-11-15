import pytest
from app.models.user import User, Profile, UserSettings
from app.models.conversation import Session as DBSession
from app.services.agent_service import process_coach_turn
from app.schemas.chat import CorrectionCardResponse

@pytest.mark.asyncio
async def test_process_coach_turn_persists_data(db_session):
    # Setup test user and profile
    user = User(username="test_user", pin_hash="hashed_pin")
    db_session.add(user)
    await db_session.flush()

    profile = Profile(
        user_id=user.id,
        full_name="Rajesh Sharma",
        target_role="Operations",
        current_cefr_level="B1"
    )
    db_session.add(profile)
    await db_session.flush()

    session = DBSession(profile_id=profile.id, mode="coach", title="Test Session")
    db_session.add(session)
    await db_session.commit()

    # Process turn with Indian English tense error
    card = await process_coach_turn(
        user_text="I am having 3 years experience in logistics.",
        profile_id=profile.id,
        session_id=session.id,
        db=db_session,
        wpm=118,
        audio_duration=2.5
    )

    assert isinstance(card, CorrectionCardResponse)
    assert card.reply != ""
    assert len(card.corrections) > 0
    # Check that 'am having' was identified
    assert any("am having" in c.original for c in card.corrections)
    assert card.scores.grammar > 0
