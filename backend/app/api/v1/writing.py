from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db
from app.models.learning import AnswerBankItem
from app.schemas.writing import WritingCheckRequest, WritingCheckResponse, STARRequest, STARResponse
from app.core.llm_provider import get_llm_provider
from app.services.agent_service import get_prompt

router = APIRouter(prefix="/tools", tags=["tools"])

@router.post("/writing/check", response_model=WritingCheckResponse)
async def check_writing(payload: WritingCheckRequest):
    """Analyze and optimize corporate emails, cover letters, and summaries."""
    llm = get_llm_provider()
    prompt = get_prompt("writing")
    context = f"Document Type: {payload.document_type}\nText to analyze:\n{payload.text}"

    try:
        data = await llm.generate_structured(context, prompt)
        return WritingCheckResponse(**data)
    except Exception:
        fallback_llm = get_llm_provider("mock")
        data = await fallback_llm.generate_structured(context, prompt)
        return WritingCheckResponse(**data)

@router.post("/builder/star", response_model=STARResponse)
async def build_star_answer(payload: STARRequest):
    """Transform raw anecdotes into structured STAR interview responses."""
    llm = get_llm_provider()
    prompt = get_prompt("builder")
    context = (
        f"Target Competency: {payload.target_competency}\n"
        f"Raw Candidate Experience Story:\n{payload.raw_story}"
    )

    try:
        data = await llm.generate_structured(context, prompt)
        return STARResponse(**data)
    except Exception:
        fallback_llm = get_llm_provider("mock")
        data = await fallback_llm.generate_structured(context, prompt)
        return STARResponse(**data)

@router.post("/builder/save")
async def save_to_answer_bank(
    profile_id: str,
    payload: STARResponse,
    db: AsyncSession = Depends(get_db)
):
    """Save a polished STAR answer into the user's permanent Answer Bank."""
    item = AnswerBankItem(
        profile_id=profile_id,
        question_title=payload.question_title,
        situation=payload.situation,
        task=payload.task,
        action=payload.action,
        result=payload.result,
        full_polished_answer=payload.full_polished_answer,
        spoken_friendly_version=payload.spoken_friendly_version
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"status": "saved", "id": item.id}

@router.get("/builder/bank/{profile_id}")
async def get_answer_bank(profile_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch all saved answers from candidate's Answer Bank."""
    stmt = select(AnswerBankItem).where(AnswerBankItem.profile_id == profile_id).order_by(AnswerBankItem.saved_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()
