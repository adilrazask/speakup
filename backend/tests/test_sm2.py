from app.services.sm2_service import calculate_sm2

def test_sm2_first_review_good():
    reps, ef, interval, next_review = calculate_sm2(
        rating=4,
        repetitions=0,
        ease_factor=2.5,
        interval_days=1
    )
    assert reps == 1
    assert interval == 1
    assert ef == 2.5

def test_sm2_second_review_good():
    reps, ef, interval, next_review = calculate_sm2(
        rating=4,
        repetitions=1,
        ease_factor=2.5,
        interval_days=1
    )
    assert reps == 2
    assert interval == 6

def test_sm2_third_review_easy():
    reps, ef, interval, next_review = calculate_sm2(
        rating=5,
        repetitions=2,
        ease_factor=2.5,
        interval_days=6
    )
    assert reps == 3
    assert interval == 16
    assert ef > 2.5

def test_sm2_failed_review_resets():
    reps, ef, interval, next_review = calculate_sm2(
        rating=1,  # Again
        repetitions=5,
        ease_factor=2.4,
        interval_days=20
    )
    assert reps == 0
    assert interval == 1
    assert ef < 2.4

def test_sm2_ease_factor_floor():
    # Repeated hard ratings should not drop EF below 1.3
    ef = 1.35
    for _ in range(5):
        _, ef, _, _ = calculate_sm2(rating=1, repetitions=0, ease_factor=ef, interval_days=1)
    assert ef == 1.3
