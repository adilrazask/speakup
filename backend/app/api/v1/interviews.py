from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db
from app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
    InterviewScore,
)
from app.schemas.interview import (
    InterviewStartRequest,
    AnswerSubmitRequest,
    InterviewReportResponse,
    PerQuestionEvaluation,
    PerQuestionScore,
    SevenDayPlanItem,
)
from app.core.llm_provider import get_llm_provider
from app.services.agent_service import get_prompt

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.post("/start")
async def start_interview(payload: InterviewStartRequest, db: AsyncSession = Depends(get_db)):
    """Initialize a mock interview session and generate the first question."""
    session = InterviewSession(
        profile_id=payload.profile_id,
        role_category=payload.role_category,
        interview_type=payload.interview_type,
        difficulty=payload.difficulty,
        job_description=payload.job_description,
        total_questions=payload.total_questions,
        started_at=datetime.utcnow()
    )
    db.add(session)
    await db.flush()

    # Pre-populate first interview question based on role
    first_q_text = "Tell me about yourself and your experience in " + payload.role_category + "."
    if "logistics" in payload.role_category.lower() or "operations" in payload.role_category.lower():
        first_q_text = "Walk me through your background in operations and logistics. How do you typically handle dispatch bottlenecks?"

    q1 = InterviewQuestion(
        interview_session_id=session.id,
        question_order=1,
        question_text=first_q_text,
        question_type="behavioral",
        target_competency="Introduction & Core Experience"
    )
    db.add(q1)
    await db.commit()
    await db.refresh(session)
    await db.refresh(q1)

    return {
        "session_id": session.id,
        "question_id": q1.id,
        "question_order": 1,
        "question_text": q1.question_text,
        "total_questions": session.total_questions
    }

@router.post("/answer")
async def submit_answer(payload: AnswerSubmitRequest, db: AsyncSession = Depends(get_db)):
    """Record candidate answer and fetch the next question or trigger conclusion."""
    # Check question
    stmt = select(InterviewQuestion).where(InterviewQuestion.id == payload.question_id)
    res = await db.execute(stmt)
    q = res.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    ans = InterviewAnswer(
        question_id=q.id,
        raw_transcript=payload.raw_transcript,
        duration_seconds=payload.duration_seconds,
        wpm=payload.wpm,
        fillers_detected=payload.fillers_detected or []
    )
    db.add(ans)
    await db.flush()

    # Check session progress
    s_stmt = select(InterviewSession).where(InterviewSession.id == payload.interview_session_id)
    s_res = await db.execute(s_stmt)
    session = s_res.scalar_one_or_none()

    if q.question_order >= (session.total_questions if session else 5):
        # Interview complete
        if session:
            session.completed_at = datetime.utcnow()
        await db.commit()
        return {
            "status": "completed",
            "message": "Interview completed! You can now generate your full evaluation report."
        }

    # Generate next question via LLM
    next_order = q.question_order + 1
    llm = get_llm_provider()
    interviewer_prompt = get_prompt("interviewer")
    context = (
        f"Candidate target role: {session.role_category if session else 'Operations'}.\n"
        f"Previous Question: {q.question_text}\n"
        f"Candidate Answer: {payload.raw_transcript}\n"
        f"Question Index: {next_order} of {session.total_questions if session else 5}.\n"
        "Ask a realistic follow-up question or probe into their specific action and result."
    )
    
    try:
        resp = await llm.generate_structured(context, interviewer_prompt)
        next_text = resp.get("reply", "Can you give me an example of how you resolved a team conflict?")
    except Exception:
        next_text = f"Thank you. In question {next_order}: How do you prioritize urgent stakeholder demands when deadlines conflict?"

    next_q = InterviewQuestion(
        interview_session_id=payload.interview_session_id,
        question_order=next_order,
        question_text=next_text,
        question_type="situational",
        target_competency="Adaptability & Execution"
    )
    db.add(next_q)
    await db.commit()
    await db.refresh(next_q)

    return {
        "status": "in_progress",
        "question_id": next_q.id,
        "question_order": next_order,
        "question_text": next_q.question_text,
        "total_questions": session.total_questions if session else 5
    }

@router.get("/report/{session_id}", response_model=InterviewReportResponse)
async def get_or_generate_report(session_id: str, db: AsyncSession = Depends(get_db)):
    """Generate or retrieve comprehensive 7-rubric Evaluator Report."""
    stmt = select(InterviewSession).where(InterviewSession.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    # Fetch questions and answers
    q_stmt = select(InterviewQuestion).where(InterviewQuestion.interview_session_id == session_id).order_by(InterviewQuestion.question_order)
    q_res = await db.execute(q_stmt)
    questions = q_res.scalars().all()

    # Call Evaluator LLM
    evaluator_prompt = get_prompt("evaluator")
    q_and_a_summaries = []
    for q in questions:
        a_stmt = select(InterviewAnswer).where(InterviewAnswer.question_id == q.id)
        a_res = await db.execute(a_stmt)
        ans = a_res.scalar_one_or_none()
        ans_text = ans.raw_transcript if ans else "No answer provided"
        q_and_a_summaries.append(f"Q{q.question_order}: {q.question_text}\nA: {ans_text}")

    context = (
        f"Evaluate this mock interview for candidate in role '{session.role_category}'.\n"
        + "\n\n".join(q_and_a_summaries)
    )

    llm = get_llm_provider()
    try:
        report_data = await llm.generate_structured(context, evaluator_prompt)
    except Exception:
        fallback_llm = get_llm_provider("mock")
        report_data = await fallback_llm.generate_structured(context, evaluator_prompt)

    overall_score = report_data.get("overall_score", 78)
    hire_readiness = report_data.get("hire_readiness", "Developing")
    strengths = report_data.get("summary_strengths", ["Clear tone", "Good structure"])
    fixes = report_data.get("summary_fixes", ["Add metrics to results", "Reduce filler words"])
    raw_evals = report_data.get("per_question_evaluations", [])
    raw_plan = report_data.get("seven_day_plan", [])

    session.overall_score = overall_score
    session.hire_readiness = hire_readiness
    session.summary_strengths = strengths
    session.summary_fixes = fixes
    session.seven_day_plan = raw_plan
    await db.commit()

    per_q_evals = []
    for i, item in enumerate(raw_evals):
        scores = item.get("scores", {})
        per_q_evals.append(
            PerQuestionEvaluation(
                question_order=item.get("question_order", i + 1),
                question_text=item.get("question_text", f"Question {i + 1}"),
                candidate_answer=item.get("candidate_answer", ""),
                scores=PerQuestionScore(
                    relevance=scores.get("relevance", 75),
                    star_structure=scores.get("star_structure", 70),
                    specificity=scores.get("specificity", 70),
                    language_accuracy=scores.get("language_accuracy", 75),
                    fluency=scores.get("fluency", 70),
                    confidence_tone=scores.get("confidence_tone", 80),
                    role_knowledge=scores.get("role_knowledge", 75),
                ),
                what_was_good=item.get("what_was_good", "Good direct answer."),
                what_to_improve=item.get("what_to_improve", "Include concrete numbers."),
                model_answer=item.get("model_answer", "Model answer demonstrating STAR structure.")
            )
        )

    plan_items = [
        SevenDayPlanItem(day=p.get("day", i + 1), focus=p.get("focus", "Practice"), action=p.get("action", "Daily drill"))
        for i, p in enumerate(raw_plan)
    ]

    return InterviewReportResponse(
        session_id=session.id,
        overall_score=overall_score,
        hire_readiness=hire_readiness,
        summary_strengths=strengths,
        summary_fixes=fixes,
        per_question_evaluations=per_q_evals,
        seven_day_plan=plan_items,
        completed_at=session.completed_at or datetime.utcnow()
    )
