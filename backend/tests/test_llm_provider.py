import pytest
from app.core.llm_provider import get_llm_provider, clean_and_repair_json, MockLLMProvider

def test_clean_and_repair_json_with_fences():
    raw = '```json\n{"reply": "Hello!", "scores": {"grammar": 80}}\n```'
    parsed = clean_and_repair_json(raw)
    assert parsed["reply"] == "Hello!"
    assert parsed["scores"]["grammar"] == 80

def test_clean_and_repair_json_trailing_comma():
    raw = '{"name": "test", "items": [1, 2, ], }'
    parsed = clean_and_repair_json(raw)
    assert parsed["name"] == "test"
    assert parsed["items"] == [1, 2]

@pytest.mark.asyncio
async def test_mock_llm_structured_generation():
    provider = MockLLMProvider()
    res = await provider.generate_structured("I am having 3 years experience")
    assert "reply" in res
    assert "corrections" in res
    assert len(res["corrections"]) > 0
    assert res["corrections"][0]["category"] == "tense"
    assert "scores" in res

@pytest.mark.asyncio
async def test_get_llm_provider_default():
    # If no key set, safely returns MockLLMProvider
    provider = get_llm_provider("mock")
    assert isinstance(provider, MockLLMProvider)
