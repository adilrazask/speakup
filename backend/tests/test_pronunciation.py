from app.services.pronunciation_service import evaluate_pronunciation, levenshtein_distance

def test_levenshtein_distance():
    assert levenshtein_distance("cat", "cat") == 0
    assert levenshtein_distance("ship", "sheep") == 2
    assert levenshtein_distance("vine", "wine") == 1

def test_pronunciation_exact_match():
    target = "We verified the warehouse voucher very thoroughly."
    spoken = "We verified the warehouse voucher very thoroughly."
    res = evaluate_pronunciation(target, spoken, duration_seconds=3.0)
    assert res.accuracy_score == 100
    assert all(ws.status == "correct" for ws in res.word_scores)
    assert res.wpm > 0

def test_pronunciation_with_fillers():
    target = "Our export consignment was cleared."
    spoken = "Um basically our export consignment was cleared actually."
    res = evaluate_pronunciation(target, spoken, duration_seconds=4.0)
    assert "um" in res.fillers_detected
    assert "basically" in res.fillers_detected
    assert "actually" in res.fillers_detected
    assert res.accuracy_score >= 80

def test_pronunciation_with_mispronounced_word():
    target = "We drank fine wine."
    spoken = "We drank fine vine."
    res = evaluate_pronunciation(target, spoken)
    # wine should be close or missed compared to vine
    wine_score = next(ws for ws in res.word_scores if ws.word == "wine.")
    assert wine_score.status in ["close", "missed"]
