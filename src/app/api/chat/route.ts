import { NextRequest, NextResponse } from "next/server";
import { callGeminiAPI, ChatTurn } from "../../../lib/gemini";

const COACH_SYSTEM_INSTRUCTION = `You are Coach Priya, a warm, motivating, patient, and highly intelligent English communication coach and mock interviewer for Indian working professionals.

Persona & Rules:
1. Warm, encouraging, and non-judgmental. Celebrate every effort.
2. Keep your conversational spoken 'reply' natural, human, and concise (2 to 4 sentences).
3. ALWAYS end your reply with one relevant follow-up question related to the candidate's experience or topic to keep them speaking.
4. Detect errors in the user's latest sentence: tenses (especially stative verbs e.g. 'I am having 3 years experience' -> 'I have...'), prepositions ('discuss about' -> 'discuss'), articles ('an unique' -> 'a unique'), plurals, Indian English collocations ('revert back' -> 'reply', 'prepone' -> 'advance/reschedule earlier', 'pass out year' -> 'graduation year'), fluency, and fillers.
5. Prioritize the top 3-5 most impactful corrections so the user is never overwhelmed.
6. Provide an encouraging, simple explanation of WHY and HOW to fix it.
7. Include helpful translations in Hindi ('explanation_hindi') and Telugu ('explanation_telugu') where appropriate.
8. Strictly preserve the candidate's authentic facts. Never invent unmentioned companies or certifications.

Return ONLY valid JSON matching this schema:
{
  "reply": "Warm conversational response acknowledging their point (2-3 sentences) + 1 natural follow-up question.",
  "corrections": [
    {
      "original": "exact substring with error",
      "corrected": "grammatically/professionally corrected substring",
      "category": "tense | article | preposition | subject-verb | vocabulary | collocation | fluency",
      "rule": "Concise grammar or usage rule",
      "explanation_simple": "Simple encouraging explanation in plain English",
      "explanation_hindi": "सरल हिन्दी व्याख्या (e.g. अनुभव बताने के लिए 'am having' नहीं, 'have' का प्रयोग करते हैं)",
      "explanation_telugu": "తెలుగు వివరణ",
      "severity": "major | minor"
    }
  ],
  "better_version": "A completely polished, professional version of the user's thought preserving their exact meaning.",
  "vocabulary_suggestions": [
    {
      "word": "streamline",
      "meaning": "make an organization or system more efficient",
      "example": "We introduced batching to streamline our daily reports."
    }
  ],
  "fluency_notes": {
    "fillers": ["basically", "um"],
    "wpm": 120,
    "long_pauses_count": 0
  },
  "scores": {
    "grammar": 78,
    "vocabulary": 75,
    "fluency": 74,
    "clarity": 82,
    "confidence": 76
  },
  "praise": "One genuine, positive compliment about what they expressed well.",
  "next_tip": "One actionable tip to apply in the very next turn."
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, history, apiKey, targetRole, cefr } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Build multi-turn context
    const turns: ChatTurn[] = [];

    // Context system message
    const roleContext = `Learner Profile: Target Role: ${targetRole || "Operations & Logistics"}, Current CEFR: ${cefr || "B1"}.`;

    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        turns.push({
          role: h.role === "user" ? "user" : "model",
          text: h.text
        });
      }
    }

    // Append latest user turn with profile context
    turns.push({
      role: "user",
      text: `${roleContext}\nCandidate said: "${content}"`
    });

    const aiResponse = await callGeminiAPI(turns, COACH_SYSTEM_INSTRUCTION, apiKey);

    if (aiResponse && aiResponse.reply) {
      return NextResponse.json(aiResponse);
    }

    // Fallback if no API key is provided
    const textLower = content.toLowerCase();
    const corrections: any[] = [];

    if (textLower.includes("am having") || textLower.includes("is having")) {
      corrections.push({
        original: "am having",
        corrected: "have",
        category: "tense",
        rule: "Stative verbs of possession take simple present, not continuous.",
        explanation_simple: "We don't use 'am having' for experience. We say 'I have'.",
        explanation_hindi: "अनुभव बताने के लिए 'am having' नहीं, 'have' का प्रयोग करते हैं।",
        explanation_telugu: "అనుభవం గురించి చెప్పేటప్పుడు 'am having' కాకుండా 'have' వాడాలి.",
        severity: "major"
      });
    } else if (textLower.includes("discuss about")) {
      corrections.push({
        original: "discuss about",
        corrected: "discuss",
        category: "preposition",
        rule: "The verb 'discuss' is transitive and does not take 'about'.",
        explanation_simple: "Say 'discuss the project', not 'discuss about the project'.",
        explanation_hindi: "'Discuss' के साथ 'about' नहीं लगाते।",
        explanation_telugu: "'Discuss' పక్కన 'about' అవసరం లేదు.",
        severity: "minor"
      });
    } else if (textLower.includes("revert back")) {
      corrections.push({
        original: "revert back",
        corrected: "reply",
        category: "collocation",
        rule: "'Revert' already means return, so adding 'back' is redundant.",
        explanation_simple: "Say 'Please reply', not 'revert back'.",
        explanation_hindi: "'Revert back' में 'back' दोहराव है।",
        explanation_telugu: "'Revert' తో 'back' వాడకూడదు.",
        severity: "minor"
      });
    } else {
      corrections.push({
        original: content.split(" ")[0] || "I",
        corrected: content.split(" ")[0] || "I",
        category: "fluency",
        rule: "Natural sentence structure.",
        explanation_simple: "Your sentence was grammatically solid and expressed your idea clearly.",
        explanation_hindi: "आपकी बात स्पष्ट और सहज थी।",
        explanation_telugu: "మీ వాక్యం సహజంగా ఉంది.",
        severity: "minor"
      });
    }

    return NextResponse.json({
      reply: `That is a great point regarding ${targetRole || "your field"}! Communicating with confidence makes a strong impression in interviews. What was the most critical decision you had to make in that situation?`,
      corrections,
      better_version: `I have solid professional experience in this area, and I successfully handled the deliverables: ${content}`,
      vocabulary_suggestions: [
        {
          word: "streamline",
          meaning: "make an organization or system more efficient",
          example: "We worked to streamline our daily reporting pipeline."
        }
      ],
      fluency_notes: {
        fillers: textLower.includes("basically") ? ["basically"] : [],
        wpm: 124,
        long_pauses_count: 0
      },
      scores: {
        grammar: 80,
        vocabulary: 75,
        fluency: 78,
        clarity: 82,
        confidence: 76
      },
      praise: "You expressed your thoughts directly and clearly.",
      next_tip: "End your next answer by highlighting the specific business result you achieved."
    });
  } catch (error: any) {
    console.error("Chat route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
