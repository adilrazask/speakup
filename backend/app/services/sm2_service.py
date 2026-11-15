from datetime import datetime, timedelta
from typing import Tuple

def calculate_sm2(
    rating: int,  # 1 (Again), 3 (Hard), 4 (Good), 5 (Easy)
    repetitions: int,
    ease_factor: float,
    interval_days: int
) -> Tuple[int, float, int, datetime]:
    """
    SuperMemo-2 (SM-2) Spaced Repetition Algorithm:
    - rating: 1 to 5
    - returns (new_repetitions, new_ease_factor, new_interval_days, next_review_at)
    """
    # Clamp rating between 1 and 5
    q = max(1, min(5, rating))

    # Calculate new ease factor
    # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ef = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    if new_ef < 1.3:
        new_ef = 1.3

    if q < 3:
        # Failed recall: reset repetitions to 0 and interval to 1 day
        new_reps = 0
        new_interval = 1
    else:
        # Successful recall
        new_reps = repetitions + 1
        if new_reps == 1:
            new_interval = 1
        elif new_reps == 2:
            new_interval = 6
        else:
            new_interval = int(round(interval_days * new_ef))

    next_review = datetime.utcnow() + timedelta(days=new_interval)
    return new_reps, round(new_ef, 2), new_interval, next_review
