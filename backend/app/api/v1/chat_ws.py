import json
import logging
from typing import List, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db
from app.core.database import AsyncSessionLocal
from app.models.conversation import Session as DBSession, Message as DBMessage
from app.models.user import Profile
from app.schemas.chat import ChatMessagePayload, CorrectionCardResponse
from app.services.agent_service import process_coach_turn

logger = logging.getLogger("speakup.chat")
router = APIRouter(tags=["chat"])

@router.post("/chat/session")
async def create_chat_session(
    profile_id: str,
    mode: str = "coach",
    title: str = "English Practice",
    db: AsyncSession = Depends(get_db)
):
    """Create a new conversational session."""
    session = DBSession(
        profile_id=profile_id,
        mode=mode,
        title=title
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"session_id": session.id, "mode": session.mode, "title": session.title}

@router.get("/chat/session/{session_id}/messages")
async def get_session_messages(session_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve message history for a session."""
    stmt = select(DBMessage).where(DBMessage.session_id == session_id).order_by(DBMessage.created_at)
    res = await db.execute(stmt)
    messages = res.scalars().all()
    return [
        {
            "id": msg.id,
            "sender": msg.sender,
            "content": msg.content,
            "structured_data": msg.structured_data,
            "wpm": msg.wpm,
            "created_at": msg.created_at.isoformat() if msg.created_at else None
        }
        for msg in messages
    ]

@router.post("/chat/message", response_model=CorrectionCardResponse)
async def post_chat_message(payload: ChatMessagePayload, db: AsyncSession = Depends(get_db)):
    """REST endpoint for single-turn message processing with structured correction card."""
    card = await process_coach_turn(
        user_text=payload.content,
        profile_id=payload.profile_id,
        session_id=payload.session_id,
        db=db,
        wpm=payload.wpm,
        audio_duration=payload.audio_duration_seconds
    )
    return card

@router.websocket("/ws/chat")
async def websocket_chat_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time bi-directional conversation streaming.
    Streams incremental tokens as the agent generates text, followed by the complete Correction Card.
    """
    await websocket.accept()
    logger.info("WebSocket client connected to /ws/chat")
    
    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                data = json.loads(raw_text)
            except Exception:
                await websocket.send_json({"type": "error", "message": "Invalid JSON format."})
                continue

            msg_type = data.get("type", "user_message")
            
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            content = data.get("content", "").strip()
            profile_id = data.get("profile_id", "")
            session_id = data.get("session_id", "")
            wpm = data.get("wpm")
            audio_duration = data.get("audio_duration_seconds")

            if not content:
                continue

            # Notify client that processing has begun
            await websocket.send_json({"type": "thinking"})

            async with AsyncSessionLocal() as db:
                # Ensure session exists
                if not session_id:
                    sess = DBSession(profile_id=profile_id, mode="coach", title="Spoken Chat")
                    db.add(sess)
                    await db.commit()
                    await db.refresh(sess)
                    session_id = sess.id
                    await websocket.send_json({"type": "session_created", "session_id": session_id})

                # Process turn and generate structured correction card
                card = await process_coach_turn(
                    user_text=content,
                    profile_id=profile_id,
                    session_id=session_id,
                    db=db,
                    wpm=wpm,
                    audio_duration=audio_duration
                )

                # Send streaming tokens for the spoken reply
                reply_words = card.reply.split(" ")
                for word in reply_words:
                    await websocket.send_json({
                        "type": "stream_chunk",
                        "chunk": word + " "
                    })

                # Finally send the full structured correction card
                await websocket.send_json({
                    "type": "correction_card",
                    "data": card.model_dump()
                })

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected normally.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
