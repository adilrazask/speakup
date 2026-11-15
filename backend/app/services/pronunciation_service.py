import re
from typing import List, Dict, Any, Tuple
from app.schemas.writing import PronunciationWordScore, PronunciationCheckResponse

COMMON_FILLERS = {"um", "uh", "like", "basically", "actually", "you know", "right", "sort of", "kind of"}

def normalize_word(word: str) -> str:
    """Strip punctuation and lowercase."""
    return re.sub(r"[^\w\s]", "", word).strip().lower()

def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute standard Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

def evaluate_pronunciation(
    target_sentence: str,
    spoken_transcript: str,
    duration_seconds: float = 0.0
) -> PronunciationCheckResponse:
    """
    Compare target sentence with spoken transcript word-by-word.
    Assigns:
    - green (correct) if exact match or distance == 0
    - amber (close) if similarity >= 0.7
    - red (missed) if missing or distorted
    """
    target_words = target_sentence.split()
    spoken_words = spoken_transcript.split()
    normalized_spoken = [normalize_word(w) for w in spoken_words]

    # Detect fillers
    detected_fillers = []
    for w in normalized_spoken:
        if w in COMMON_FILLERS:
            detected_fillers.append(w)

    word_scores: List[PronunciationWordScore] = []
    correct_count = 0
    spoken_idx = 0

    for tw in target_words:
        clean_tw = normalize_word(tw)
        if not clean_tw:
            continue

        matched = False
        # Search window in spoken words
        best_match = None
        best_sim = 0.0
        best_spoken_pos = -1

        window_start = max(0, spoken_idx - 1)
        window_end = min(len(normalized_spoken), spoken_idx + 3)

        for pos in range(window_start, window_end):
            sw = normalized_spoken[pos]
            dist = levenshtein_distance(clean_tw, sw)
            max_len = max(len(clean_tw), len(sw))
            sim = 1.0 - (dist / max_len) if max_len > 0 else 1.0

            if sim > best_sim:
                best_sim = sim
                best_match = spoken_words[pos]
                best_spoken_pos = pos

        if best_sim >= 0.85:
            status = "correct"
            correct_count += 1
            spoken_idx = best_spoken_pos + 1
        elif best_sim >= 0.60:
            status = "close"
            correct_count += 0.5
            spoken_idx = best_spoken_pos + 1
        else:
            status = "missed"

        word_scores.append(
            PronunciationWordScore(
                word=tw,
                matched_word=best_match if status != "missed" else None,
                status=status,
                phonetic_similarity=round(best_sim, 2)
            )
        )

    accuracy = int(round((correct_count / len(target_words)) * 100)) if target_words else 100
    
    # Calculate WPM
    wpm = 0
    if duration_seconds > 0 and spoken_words:
        wpm = int((len(spoken_words) / duration_seconds) * 60)

    return PronunciationCheckResponse(
        target_sentence=target_sentence,
        spoken_transcript=spoken_transcript,
        accuracy_score=accuracy,
        wpm=wpm,
        word_scores=word_scores,
        fillers_detected=detected_fillers
    )
