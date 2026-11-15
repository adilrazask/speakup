import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.core.config import settings

router = APIRouter(prefix="/seed", tags=["seed"])

@router.get("/questions")
async def get_seed_questions(category: str = ""):
    """Fetch interview questions, optionally filtered by category."""
    path = settings.SEED_DIR / "interview_questions.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Seed questions not found")
    data = json.loads(path.read_text(encoding="utf-8"))
    if category:
        data = [q for q in data if category.lower() in q.get("category_key", "").lower()]
    return data

@router.get("/drills")
async def get_seed_drills():
    """Fetch pronunciation sentences and minimal pairs."""
    path = settings.SEED_DIR / "pronunciation_drills.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Seed drills not found")
    return json.loads(path.read_text(encoding="utf-8"))

@router.get("/placement")
async def get_placement_test():
    """Fetch placement test questions."""
    path = settings.SEED_DIR / "placement_test.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Placement test not found")
    return json.loads(path.read_text(encoding="utf-8"))
