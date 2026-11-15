import json
import logging
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.vocabulary import VocabularyItem

logger = logging.getLogger("speakup.seed")

async def load_seed_data(db: AsyncSession) -> None:
    """Populate database with seed vocabulary and default data if empty."""
    vocab_file = settings.SEED_DIR / "vocabulary.json"
    if not vocab_file.exists():
        return

    # Check if vocabulary already populated
    check_stmt = select(VocabularyItem).limit(1)
    res = await db.execute(check_stmt)
    if res.scalar_one_or_none():
        return

    logger.info("Seeding vocabulary database from seed/vocabulary.json...")
    try:
        data = json.loads(vocab_file.read_text(encoding="utf-8"))
        for item in data:
            vocab = VocabularyItem(
                word_or_phrase=item["word_or_phrase"],
                cefr_level=item.get("cefr_level", "B1"),
                context_tag=item.get("context_tag", "workplace"),
                definition_simple=item.get("definition_simple", ""),
                workplace_example=item.get("workplace_example", ""),
                collocations=item.get("collocations", "")
            )
            db.add(vocab)
        await db.commit()
        logger.info(f"Successfully seeded {len(data)} vocabulary items.")
    except Exception as e:
        logger.error(f"Error seeding vocabulary: {e}")
        await db.rollback()
