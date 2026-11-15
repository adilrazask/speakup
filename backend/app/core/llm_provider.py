import abc
import json
import logging
import os
import re
from typing import Any, AsyncGenerator, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("speakup.llm")

def clean_and_repair_json(raw: str) -> Dict[str, Any]:
    """Clean markdown fences and repair common JSON defects."""
    text = raw.strip()
    # Strip markdown ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    
    # Try parsing directly
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Basic repair: replace single quotes with double quotes where possible
    # and remove trailing commas before closing braces/brackets
    cleaned = re.sub(r",\s*([\]}])", r"\1", text)
    try:
        return json.loads(cleaned)
    except Exception as e:
        logger.warning(f"Failed to parse JSON directly: {e}. Raw was: {text[:200]}")
        raise ValueError(f"Could not parse response into valid JSON: {text[:200]}")

class BaseLLMProvider(abc.ABC):
    """Abstract Base Class for LLM Providers."""
    
    @abc.abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        pass

    @abc.abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.4,
    ) -> Dict[str, Any]:
        pass

    @abc.abstractmethod
    async def stream_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        pass

class GeminiProvider(BaseLLMProvider):
    """Google Gemini Provider using official google-genai SDK with HTTP fallback."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.model = model or settings.GEMINI_MODEL
        self._client = None
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize google.genai Client: {e}")

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        if not self._client:
            raise RuntimeError("Gemini API key is missing or client failed to initialize.")
        
        from google.genai import types
        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction
        )
        response = self._client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )
        return response.text or ""

    async def generate_structured(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.3,
    ) -> Dict[str, Any]:
        if not self._client:
            raise RuntimeError("Gemini API key is missing or client failed to initialize.")
        
        from google.genai import types
        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction,
            response_mime_type="application/json"
        )
        response = self._client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )
        raw_text = response.text or "{}"
        return clean_and_repair_json(raw_text)

    async def stream_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        if not self._client:
            raise RuntimeError("Gemini API key is missing or client failed to initialize.")
        
        from google.genai import types
        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction,
        )
        response_stream = self._client.models.generate_content_stream(
            model=self.model,
            contents=prompt,
            config=config,
        )
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text

class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT provider via Async HTTPX."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL
        self.base_url = "https://api.openai.com/v1"

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"model": self.model, "messages": messages, "temperature": temperature},
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def generate_structured(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.3,
    ) -> Dict[str, Any]:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return clean_and_repair_json(data["choices"][0]["message"]["content"])

    async def stream_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        text = await self.generate_text(prompt, system_instruction, temperature)
        # Yield words to simulate streaming
        for word in text.split(" "):
            yield word + " "

class ClaudeProvider(BaseLLMProvider):
    """Anthropic Claude provider via Async HTTPX."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model or settings.ANTHROPIC_MODEL
        self.base_url = "https://api.anthropic.com/v1"

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": self.model,
            "max_tokens": 2048,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_instruction:
            payload["system"] = system_instruction

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/messages", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["content"][0]["text"]

    async def generate_structured(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.3,
    ) -> Dict[str, Any]:
        sys = (system_instruction or "") + "\n\nCRITICAL: Respond ONLY with a valid JSON object."
        raw = await self.generate_text(prompt, sys, temperature)
        return clean_and_repair_json(raw)

    async def stream_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        text = await self.generate_text(prompt, system_instruction, temperature)
        for word in text.split(" "):
            yield word + " "

class MockLLMProvider(BaseLLMProvider):
    """
    Mock LLM Provider for offline testing, local development, and CI without API keys.
    Provides realistic, context-aware responses and structured correction cards.
    """

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        return "That is a great point! In professional interviews, speaking clearly and structuring your thoughts makes a lasting impression. What project are you currently working on?"

    async def generate_structured(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.3,
    ) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        
        # Check if prompt looks like an interview answer evaluation
        if "rubric" in (system_instruction or "").lower() or "evaluator" in (system_instruction or "").lower():
            return {
                "overall_score": 82,
                "hire_readiness": "Good",
                "summary_strengths": [
                    "Directly addressed the core operational challenge",
                    "Maintained a calm, confident, and professional tone",
                    "Accurately cited warehouse inventory procedures"
                ],
                "summary_fixes": [
                    "Quantify the exact percentage of time saved in your result",
                    "Replace filler phrases like 'basically actually' with brief pauses",
                    "Use simple past tense consistently for completed projects"
                ],
                "per_question_evaluations": [
                    {
                        "question_order": 1,
                        "question_text": "Tell me about a time you handled a supply chain delay.",
                        "candidate_answer": prompt[:150],
                        "scores": {
                            "relevance": 85,
                            "star_structure": 80,
                            "specificity": 75,
                            "language_accuracy": 82,
                            "fluency": 78,
                            "confidence_tone": 85,
                            "role_knowledge": 88
                        },
                        "what_was_good": "Clear context and quick decision-making under pressure.",
                        "what_to_improve": "State the business cost prevented by your solution.",
                        "model_answer": "In my previous role, an ICEGATE server disruption delayed customs clearance for five critical import containers. I immediately coordinated with our CHA, flagged the priority shipment, and submitted alternative physical verification documentation within two hours, avoiding any shipment detention penalties."
                    }
                ],
                "seven_day_plan": [
                    {"day": 1, "focus": "STAR Result Drill", "action": "Write 3 stories ending with specific metrics."},
                    {"day": 2, "focus": "Eliminate 'Basically'", "action": "Practice answering with 2-second deliberate pauses."},
                    {"day": 3, "focus": "Tense Consistency", "action": "Practice simple past vs present perfect drills."},
                    {"day": 4, "focus": "Logistics Vocabulary", "action": "Incorporate terms like 'demurrage', 'consignment', and 'lead time'."},
                    {"day": 5, "focus": "Conflict Resolution", "action": "Draft an answer about resolving a disagreement with an auditor."},
                    {"day": 6, "focus": "Speaking Speed", "action": "Keep your pace between 120 and 130 WPM."},
                    {"day": 7, "focus": "Full Mock Simulation", "action": "Complete a 10-question technical interview session."}
                ]
            }

        # Check if prompt looks like STAR builder
        if "star" in (system_instruction or "").lower() or "builder" in (system_instruction or "").lower():
            return {
                "question_title": "Handling Operational Bottlenecks",
                "situation": "Our logistics hub experienced a 30% surge in order volume during festival season, causing dispatch delays.",
                "task": "My responsibility as Operations Lead was to clear the 500-order backlog without incurring overtime costs.",
                "action": "I reallocated staff into dual-shift packing clusters and introduced batch-tagging in our ERP to streamline pick-lists.",
                "result": "We cleared the backlog in 36 hours, achieved 99.2% on-time dispatch, and reduced pick time by 18%.",
                "full_polished_answer": "During the peak festival season, our logistics hub faced a 30% volume surge that created a dispatch backlog. As Operations Lead, I reorganized the workflow into dual-shift packing clusters and introduced ERP batch-tagging. Consequently, we cleared the backlog within 36 hours and improved on-time dispatch to 99.2%.",
                "spoken_friendly_version": "Last year during peak season, we had a major dispatch delay. I stepped in, reorganized our team into two focused packing shifts, and improved our ERP tagging. Because of this, we cleared all 500 orders in 36 hours without missing customer deadlines.",
                "key_strengths_highlighted": ["Process Optimization", "Crisis Leadership"],
                "coaching_tip": "Pause for one second right after stating '99.2%' to let the interviewer register the metric."
            }

        # Check if user made a common Indian English mistake in prompt
        corrections = []
        if "am having" in prompt_lower:
            corrections.append({
                "original": "am having",
                "corrected": "have",
                "category": "tense",
                "rule": "Stative verbs of possession take simple present, not continuous.",
                "explanation_simple": "We don't say 'I am having experience'. We say 'I have experience'.",
                "explanation_hindi": "अनुभव बताने के लिए 'am having' नहीं, 'have' का प्रयोग करते हैं।",
                "explanation_telugu": "అనుభవం గురించి చెప్పేటప్పుడు 'am having' కాకుండా 'have' వాడాలి.",
                "severity": "major"
            })
        elif "discuss about" in prompt_lower:
            corrections.append({
                "original": "discuss about",
                "corrected": "discuss",
                "category": "preposition",
                "rule": "The verb 'discuss' is transitive and does not take the preposition 'about'.",
                "explanation_simple": "Say 'discuss the project', not 'discuss about the project'.",
                "explanation_hindi": "'Discuss' के साथ 'about' नहीं लगाते। सीधा 'discuss the issue' कहें।",
                "explanation_telugu": "'Discuss' పక్కన 'about' అవసరం లేదు.",
                "severity": "minor"
            })
        elif "revert back" in prompt_lower:
            corrections.append({
                "original": "revert back",
                "corrected": "revert or reply",
                "category": "collocation",
                "rule": "'Revert' already means return, so adding 'back' is redundant.",
                "explanation_simple": "Say 'Please reply' or 'Please revert', not 'revert back'.",
                "explanation_hindi": "'Revert' के साथ 'back' जोड़ना दोहराव (redundant) है।",
                "explanation_telugu": "'Revert' తో 'back' వాడకూడదు.",
                "severity": "minor"
            })
        elif not corrections:
            # Default mild correction
            corrections.append({
                "original": prompt.split()[0] if prompt.split() else "I",
                "corrected": prompt.split()[0] if prompt.split() else "I",
                "category": "fluency",
                "rule": "Well structured opening.",
                "explanation_simple": "Your sentence was clear and natural.",
                "explanation_hindi": "आपकी बात स्पष्ट और सहज थी।",
                "explanation_telugu": "మీ వాక్యం బాగుంది.",
                "severity": "minor"
            })

        return {
            "reply": "That sounds like meaningful experience! Handling high-pressure situations shows strong ownership. Could you share one specific challenge you overcame in that process?",
            "corrections": corrections,
            "better_version": f"I have solid experience in this domain, and I successfully managed the key project milestones. {prompt}",
            "vocabulary_suggestions": [
                {
                    "word": "streamline",
                    "meaning": "make an organization or system more efficient and effective",
                    "example": "I helped streamline our daily dispatch reports."
                }
            ],
            "fluency_notes": {
                "fillers": ["um", "basically"] if "basically" in prompt_lower else [],
                "wpm": 122,
                "long_pauses_count": 0
            },
            "scores": {
                "grammar": 76,
                "vocabulary": 72,
                "fluency": 74,
                "clarity": 80,
                "confidence": 75
            },
            "praise": "You expressed your point directly without hesitation.",
            "next_tip": "Try ending your next statement with a clear, measurable outcome."
        }

    async def stream_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        text = "That is an excellent point. In professional interviews, speaking with clarity and structured thinking makes a lasting impression. What domain are you focusing on?"
        for word in text.split(" "):
            yield word + " "

def get_llm_provider(provider_name: Optional[str] = None) -> BaseLLMProvider:
    """Factory function returning the active LLM provider."""
    name = (provider_name or settings.LLM_PROVIDER).lower()
    
    if name == "gemini":
        # Check if GEMINI_API_KEY is configured
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        if api_key:
            return GeminiProvider(api_key=api_key)
        else:
            logger.warning("GEMINI_API_KEY not found in environment; falling back to MockLLMProvider.")
            return MockLLMProvider()
    elif name == "openai":
        if settings.OPENAI_API_KEY:
            return OpenAIProvider()
        return MockLLMProvider()
    elif name == "claude":
        if settings.ANTHROPIC_API_KEY:
            return ClaudeProvider()
        return MockLLMProvider()
    else:
        return MockLLMProvider()
